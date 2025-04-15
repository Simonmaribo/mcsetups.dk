import type Server from "@/interfaces/Server";
import { uploadFiles } from "@/libs/r2";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

const router = require("express").Router({ mergeParams: true });

import multer from 'multer';
import { NotificationType } from "database";
//const upload = multer({ dest: 'tmp/' })
const upload = multer({
    limits: {
        fieldSize: 10485760,
        fileSize: 10485760,
    }
});

module.exports = (server: Server) => {
    return {
        router: () => {
            router.put("/", server.authManager.ensureAuthentication, upload.fields([{ name: "banner", maxCount: 1 }]), async (req: Request, res: Response) => {
                if(!req.user || !req.user.verified)
                    return res.status(401).send({ message: "Unauthorized" });

                let productId = parseId(req, res, "productId");
                if(productId === -1) return;
                let oldProduct = await server.database.product.findFirst({
                    where: {
                        id: productId,
                        creatorId: req.user.id
                    }
                });
                if(!oldProduct) return res.status(404).send({ message: "Not found" });

                let { title, description, price, minecraftVersions, tags, brief, sale } = req.body;
                if(!title || !description || !price || !minecraftVersions || !tags || !brief)
                    return res.status(400).send({ message: "Bad request, missing parameters" });
                if(title.length > 100)
                    return res.status(400).send({ message: "Bad request, title is too long" });
                if(description.length > 5000)
                    return res.status(400).send({ message: "Bad request, description is too long" });
                if(brief.length > 250)
                    return res.status(400).send({ message: "Bad request, brief is too long" });
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

                if(sale && sale >= 0){
                    try {
                        sale = parseFloat(sale);
                        sale = Math.round(sale * 100);
                    } catch (e) {
                        return res.status(400).send({ message: "Bad request, sale is not a number" });
                    }
                    if(sale < 0)
                        return res.status(400).send({ message: "Bad request, sale is too low" });
                    if(sale >= price)
                        return res.status(400).send({ message: "Bad request, sale is too high" });
                } else sale = -1;

                let bannerId = null;

                if(req.files){
                    if(!(req.files instanceof Array) && req.files.banner){
                        if(!(req.files.banner instanceof Array) || req.files.banner.length < 1)
                            return res.status(400).send({ message: "Bad request, no banner provided" });
                        else {
                            const banner = req.files.banner[0];
                            const bannerName = `${uuidv4().replace(/-/g, "")}.${banner.originalname.split(".").pop()}`;
                            
                            if(!await uploadFiles([
                                { file: banner, folder: `images`, fileName: bannerName },
                            ]))
                                return res.status(500).send({ message: "Internal server error" });
                            bannerId = bannerName;
                        }
                    }
                }

                let product = await server.database.product.update({
                    where: {
                        id: productId
                    },
                    data: {
                        title,
                        description,
                        price,
                        brief,
                        sale,
                        minecraftVersions,
                        tags,
                        bannerId: bannerId || oldProduct.bannerId,
                        updatedAt: new Date()
                    }
                });

                if(!product)
                    return res.status(500).send({ message: "Internal server error" });
                res.status(200).send({ message: "Product has been updated" });

                if(oldProduct.price !== product.price){
                    await server.database.productPriceHistory.create({
                        data: {
                            productId: product.id,
                            price: product.price,
                            createdAt: new Date(),
                        }
                    });
                }

                const removeOldNotifications = (() => {
                    if(oldProduct.price !== product.price) return true;
                    if(oldProduct.sale !== product.sale) return true;
                    return false;
                })()
                if(removeOldNotifications){
                    await server.database.notification.deleteMany({
                        where: {
                            metadata: {
                                path: "$.productId",
                                equals: product.id
                            },
                            OR: [
                                { type: NotificationType.FAVORITE_ON_SALE },
                                { type: NotificationType.FAVORITE_PRICE_CHANGE }
                            ]
                        }
                    });
                }

                if(product.sale >= 0 && product.sale !== oldProduct.sale){
                    try {
                        let users = await server.database.userFavoriteProduct.findMany({
                            where: {
                                productId: product.id
                            },
                            select: {
                                userId: true
                            }
                        }).then(favorites => favorites.map(favorite => favorite.userId));
                        let data = users.map(userId => ({
                            userId,
                            type: NotificationType.FAVORITE_ON_SALE,
                            metadata: {
                                productId: product.id,
                                productName: product.title,
                                productSale: product.sale,
                            }
                        }));
                        await server.database.notification.createMany({ data });
                    }
                    catch (err) {
                        console.error(err);
                    }
                }

                if(product.sale === -1 && product.price !== oldProduct.price && product.price < oldProduct.price){
                    try {
                        let users = await server.database.userFavoriteProduct.findMany({
                            where: {
                                productId: product.id
                            },
                            select: {
                                userId: true
                            }
                        }).then(favorites => favorites.map(favorite => favorite.userId));
                        let data = users.map(userId => ({
                            userId,
                            type: NotificationType.FAVORITE_PRICE_CHANGE,
                            metadata: {
                                productId: product.id,
                                productName: product.title,
                                productPrice: product.price,
                            }
                        }));
                        await server.database.notification.createMany({ data });
                    }
                    catch (err) {
                        console.error(err);
                    }
                }

                return;
            });
            
            return router;
        }
    }
}