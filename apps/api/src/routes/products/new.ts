import type Server from "@/interfaces/Server";
import { uploadFiles } from "@/libs/r2";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { ProductType } from "database";

const router = require("express").Router({ mergeParams: true });

import multer from 'multer';
//const upload = multer({ dest: 'tmp/' })
const upload = multer({
    limits: {
        fieldSize: 10485760*3,
        fileSize: 10485760*2*3,
    }
});

module.exports = (server: Server) => {
    return {
        router: () => {
            router.post("/", server.authManager.ensureAuthentication, upload.fields([{ name: 'resource', maxCount: 1 }, { name: "banner", maxCount: 1 }]), async (req: Request, res: Response) => {
                if(!req.user || !req.user.verified)
                    return res.status(401).send({ message: "Unauthorized" });
                let { title, type, version, brief, description, price, skriptVersion, minecraftVersions, tags, licensable, licensePluginName } = req.body;
                if(!title || !type || !version || !description || !price || !minecraftVersions || !tags)
                    return res.status(400).send({ message: "Bad request, missing parameters" });
                if(title.length > 100)
                    return res.status(400).send({ message: "Bad request, title is too long" });
                if(brief.length > 250)
                    return res.status(400).send({ message: "Bad request, brief is too long" });
                if(description.length > 5000)
                    return res.status(400).send({ message: "Bad request, description is too long" });
                if(version.length > 20 || version.length < 1)
                    return res.status(400).send({ message: "Bad request, version is too long or too short" });
                if(!["skript", "plugin", "setup", "map"].includes(type))
                    return res.status(400).send({ message: "Bad request, type is invalid" });
                try {
                    let parsedVersions = JSON.parse(minecraftVersions);
                    if(!(parsedVersions instanceof Array))
                        return res.status(400).send({ message: "Bad request, minecraftVersions is not an array" });
                } catch (e) {
                    return res.status(400).send({ message: "Bad request, minecraftVersions is not valid json" });
                }

                try {
                    let parsedTags = JSON.parse(tags);
                    if(!(parsedTags instanceof Array))
                        return res.status(400).send({ message: "Bad request, tags is not an array" });
                    if(parsedTags.length > 6)
                        return res.status(400).send({ message: "Bad request, too many tags" });
                } catch (e) {
                    return res.status(400).send({ message: "Bad request, tags is not valid json" });
                }
                if(type === "skript") {
                    if(!skriptVersion)
                        return res.status(400).send({ message: "Bad request, skriptVersion is missing" });
                    if(skriptVersion.length > 20 || skriptVersion.length < 1)
                        return res.status(400).send({ message: "Bad request, skriptVersion is too long or too short" });
                }
                if(type === "plugin") {
                    if(`${licensable}` == `true` && !licensePluginName)
                        return res.status(400).send({ message: "Bad request, licensePluginName is missing" });
                }
                try {
                    price = parseFloat(price);
                    price = Math.round(price * 100);
                } catch (e) {
                    return res.status(400).send({ message: "Bad request, price is not a number" });
                }
                if(price < 0)
                    return res.status(400).send({ message: "Bad request, price is too low" });
                if(price > 1000_00)
                    return res.status(400).send({ message: "Bad request, price is too high" });

                if(!req.files || !(typeof req.files === "object"))
                    return res.status(400).send({ message: "Bad request, no files provided" });
                if((req.files instanceof Array))
                    return res.status(400).send({ message: "Bad request, files is an array" });
                if(!req.files.resource || !req.files.banner || !(req.files.resource instanceof Array) || !(req.files.banner instanceof Array) || req.files.resource.length < 1 || req.files.banner.length < 1)
                    return res.status(400).send({ message: "Bad request, no resource or banner provided" });

                const resource = req.files.resource[0];
                const banner = req.files.banner[0];

                if(!resource || !banner) return res.status(400).send({ message: "Bad request, no resource or banner provided" });

                const bannerName = `${uuidv4().replace(/-/g, "")}.${banner.originalname.split(".").pop()}`;
                const resourceName = `${title}-${version};[${uuidv4().replace(/-/g, "")}];.${resource.originalname.split(".").pop()}`;


                if(!await uploadFiles([
                    { file: resource, folder: `resources`, fileName: resourceName },
                    { file: banner, folder: `images`, fileName: bannerName },
                ]))
                    return res.status(500).send({ message: "Internal server error" });
                
                const typeEnum: ProductType = type === "skript" ? ProductType.SKRIPT : type === "plugin" ? ProductType.PLUGIN : type === "setup" ? ProductType.SETUP : ProductType.MAP;

                let date = new Date();

                let product = await server.database.product.create({
                    data: {
                        creatorId: req.user.id,
                        title,
                        brief,
                        description,
                        type: typeEnum,
                        bannerId: bannerName,
                        price,
                        skriptVersion,
                        licensable: `${licensable}` == `true` ? true : false,
                        licensePluginName,
                        minecraftVersions,
                        tags,
                        createdAt: date,
                        updatedAt: date,
                        releases: {
                            create: [{
                                title,
                                version,
                                resourceId: resourceName,
                                resourceSize: resource.size,
                                createdAt: date,
                                updatedAt: date,
                            }],
                        },
                    }
                });
                if(!product)
                    return res.status(500).send({ message: "Internal server error" });
                res.status(200).send({ message: "Product has been created" });

                await server.database.productPriceHistory.create({
                    data: {
                        productId: product.id,
                        price,
                        createdAt: date,
                    }
                });
                return;
            });
            
            return router;
        }
    }
}