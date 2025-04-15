import type Server from "@/interfaces/Server";
import { uploadFiles } from "@/libs/r2";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

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
            router.post("/", server.authManager.ensureAuthentication, upload.fields([{ name: 'resource', maxCount: 1 }]), async (req: Request, res: Response) => {
                if(!req.user || !req.user.verified) return res.status(401).send({ message: "Unauthorized" });

                let productId = parseId(req, res, "productId");

                let { title, version, changelog } = req.body;
                if(!title || !version || !changelog)
                    return res.status(400).send({ message: "Bad request, missing parameters" });
                if(title.length > 100)
                    return res.status(400).send({ message: "Bad request, title is too long" });
                if(version.length > 20 || version.length < 1)
                    return res.status(400).send({ message: "Bad request, version is too long or too short" });


                if(!req.files || !(typeof req.files === "object"))
                    return res.status(400).send({ message: "Bad request, no files provided" });
                if((req.files instanceof Array))
                    return res.status(400).send({ message: "Bad request, files is an array" });
                
                if(!req.files.resource || !(req.files.resource instanceof Array) || req.files.resource.length < 1)
                    return res.status(400).send({ message: "Bad request, no resource provided" });

                const resource = req.files.resource[0];

                if(!resource) return res.status(400).send({ message: "Bad request, no resource provided" });


                let releaseWithId = await server.database.productRelease.findFirst({
                    where: {
                        productId,
                        version,
                    }
                });

                if(releaseWithId)
                    return res.status(400).send({ message: "Bad request, release with this version already exists" });

                const resourceName = `${title}-${version}-;[${uuidv4().replace(/-/g, "")}];.${resource.originalname.split(".").pop()}`;

                if(!await uploadFiles([
                    { file: resource, folder: `resources`, fileName: resourceName },
                ]))
                    return res.status(500).send({ message: "Internal server error" });

                let release = await server.database.productRelease.create({
                    data: {
                        productId,
                        title,
                        version,
                        changelog,
                        resourceId: resourceName,
                        resourceSize: resource.size,
                    }
                });

                if(!release)
                    return res.status(500).send({ message: "Internal server error" });
                return res.status(200).send({ message: "Release has been created" });
            });
            
            return router;
        }
    }
}