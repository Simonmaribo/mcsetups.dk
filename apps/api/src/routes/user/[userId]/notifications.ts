import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/unread", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let notifications = await server.database.notification.findMany({
                    where: {
                        userId,
                        read: false
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })

                return res.json(notifications);
            });

            router.post("/read/all", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;

                let date = new Date();

                await server.database.notification.updateMany({
                    where: {
                        userId,
                        read: false
                    },
                    data: {
                        read: true,
                        readAt: date
                    }
                })

                return res.json({ success: true });
            });

            router.post("/read/:notificationId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;

                let notificationId = parseId(req, res, "notificationId");
                if(!notificationId || notificationId == -1) return;

                let date = new Date();

                await server.database.notification.update({
                    where: {
                        id: notificationId
                    },
                    data: {
                        read: true,
                        readAt: date
                    }
                })

                return res.json({ success: true });
            
            });
            
            return router;
        }
    }
}