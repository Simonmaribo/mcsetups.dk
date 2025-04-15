import { PurchaseType } from 'database';
import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });
                let id = parseId(req, res, "productId");
                if (id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if (!product) return res.status(404).json({ error: "Product not found" });
                if (req.user.id != product.creatorId && req.user.group > 1) return res.status(403).json({ error: "Forbidden" });

                let purchases = await server.database.purchase.findMany({
                    where: {
                        productId: id
                    },
                    select: {
                        id: true,
                        userId: true,
                        createdAt: true,
                        type: true,
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                                discordId: true,
                            }
                        },
                        transaction: {
                            select: {
                                amount: true,
                            }
                        }
                    }
                });

                return res.json(purchases);
            });

            router.get("/graph", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });
                let id = parseId(req, res, "productId");
                if (id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if (!product) return res.status(404).json({ error: "Product not found" });
                if (req.user.id != product.creatorId && req.user.group > 1) return res.status(403).json({ error: "Forbidden" });

                // count purchases for for each day of the last 30 days
                let purchases = await server.database.purchase.findMany({
                    where: {
                        productId: id,
                        //type: PurchaseType.PURCHASE,
                        createdAt: {
                            gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
                        }
                    },
                    select: {
                        createdAt: true,
                    }
                });

                let data: { date: Date, purchases: number }[] = [];
                // add all dates to the data array with 0 purchases
                for (let i = 0; i < 30; i++) {
                    let date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
                    date.setHours(0, 0, 0, 0);
                    data.push({ date, purchases: 0 });
                }

                // add the purchases to the data array
                for (let purchase of purchases) {
                    let date = new Date(purchase.createdAt.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if (index != -1) data[index].purchases++;
                }

                // reverse the array so the newest date is first
                data.reverse();

                return res.json(data);
            });

            router.post("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "productId");
                if (id === -1) return;

                let { userId } = req.body;
                let parsedUserId = parseInt(`${userId}`);
                if (!userId || !parsedUserId) return res.status(400).json({ error: "Ugyldigt bruger id." });

                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if (!product) return res.status(404).json({ error: "Produktet blev ikke fundet." });
                if (req.user.id != product.creatorId && req.user.group > 0) return res.status(403).json({ error: "Forbidden" });
                let user = await server.database.user.findFirst({
                    where: {
                        OR: [
                            {
                                discordId: `${userId}`
                            },
                            {
                                id: parsedUserId
                            }
                        ]
                    },
                    select: {
                        id: true,
                    }
                });

                if (!user) return res.status(404).json({ error: "Brugeren blev ikke fundet." });
                if (user.id == req.user.id) return res.status(400).json({ error: "Du kan ikke tilføje dig selv." });

                // check if purchase exists
                let purchase = await server.database.purchase.findFirst({
                    where: {
                        productId: id,
                        userId: user.id,
                    },
                    select: {
                        id: true,
                    }
                });

                if (purchase) return res.status(400).json({ error: "Brugeren ejeren allerede produktet." });

                // create purchase
                purchase = await server.database.purchase.create({
                    data: {
                        productId: id,
                        userId: user.id,
                        type: PurchaseType.MANUAL
                    }
                });

                return res.json(purchase);
            });

            router.delete("/:userId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "productId");
                if (id === -1) return;

                let userId = parseId(req, res, "userId");
                if (userId === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if (!product) return res.status(404).json({ error: "Produktet blev ikke fundet." });
                if (req.user.id != product.creatorId && req.user.group > 0) return res.status(403).json({ error: "Forbidden" });

                let purchase = await server.database.purchase.findFirst({
                    where: {
                        productId: id,
                        userId
                    },
                    select: {
                        id: true,
                        userId: true,
                        type: true,
                    }
                });

                if (!purchase) return res.status(404).json({ error: "Købet blev ikke fundet." });
                if (purchase.type == PurchaseType.PURCHASE) return res.status(400).json({ error: "Købet kan ikke slettes." });

                await server.database.purchase.delete({
                    where: {
                        id: purchase.id
                    }
                });

                await server.database.productLicense.deleteMany({
                    where: {
                        productId: product.id,
                        userId: purchase.userId
                    }
                });

                return res.json({ success: true });
            });

            return router;
        }
    }
}