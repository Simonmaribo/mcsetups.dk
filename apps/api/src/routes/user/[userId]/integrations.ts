import Route from "@/interfaces/Route";
import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server): Route => {
    return {
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized." });
                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let integrations = await server.database.integration.findMany({
                    where: {
                        userId,
                    }
                })

                return res.json(integrations);
            });

            
            return router;
        }
    }
}