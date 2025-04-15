import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to view this user's balance" })

                const user = await server.database.user.findFirst({
                    where: {
                        id
                    }
                });
                if(!user) return res.status(404).json({ error: "User not found" });
                return res.json(user);
            });

            router.get("/balance", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to view this user's balance" })

                const balance = await server.database.user.findFirst({
                    where: {
                        id
                    },
                    select: {
                        balance: true,
                        tempBalance: {
                            select: {
                                amount: true,
                                availableAt: true
                            }
                        }
                    }
                });
                if(!balance) return res.status(404).json({ error: "User not found" });
                return res.json(balance);
            });

            router.get("/purchases", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(!id || id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })
               
                const purchases = await server.database.purchase.findMany({
                    where: {
                        userId: id
                    },
                    select: {
                        id: true,
                        type: true,
                        product: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                licensable: true,
                                createdAt: true,
                            },
                        },
                        transactionId: true,
                        createdAt: true,
                    }
                });

                return res.json(purchases);
            });
            
            return router;
        }
    }
}