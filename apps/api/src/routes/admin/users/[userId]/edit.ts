import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {

            router.put("/", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized." });

                let userId = parseId(req, res, "userId");
                if(!userId || userId === -1) return;


                let { verified } = req.body;
                if(verified === undefined) return res.status(400).json({ error: "Missing parameters." });


                let user = await server.database.user.findFirst({
                    where: {
                        id: userId
                    }
                });

                if(!user) return res.status(404).json({ error: "User not found." });
                if(req.user.group >= user.group || req.user.group != 0) return res.status(403).json({ error: "Forbidden." });
                
                await server.database.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        verified
                    }
                });

                return res.status(200).json({ message: "User updated." });
            });

            return router;
        }
    }
}