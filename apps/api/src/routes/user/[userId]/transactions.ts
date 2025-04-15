import { TransactionType } from 'database';
import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { getURL } from '@/libs/r2';

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let { page = 1, limit = 10 } = req.query;

                if (typeof page !== "number") page = parseInt(`${page}`);
                if (typeof limit !== "number") limit = parseInt(`${limit}`);

                if (limit > 25) limit = 25;
                if (page < 1) page = 1;

                const transactions = await server.database.transaction.findMany({
                    where: {
                        userId: userId,
                    },
                    select: {
                        id: true,
                        userId: true,
                        type: true,
                        amount: true,
                        createdAt: true,
                        product: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                });

                return res.status(200).send(transactions);
            });

            router.get("/graph", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });
                let id = parseId(req, res, "userId", req.user);
                if(id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })

                let transactions = await server.database.transaction.findMany({
                    where: {
                        userId: id,
                        type: TransactionType.SALE,
                        createdAt: {
                            gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
                        }
                    },
                    select: {
                        createdAt: true,
                        amount: true,
                    }
                });

                let data: { date: Date, amount: number }[] = [];
                // add all dates to the data array with 0 purchases
                for(let i = 0; i < 30; i++) {
                    let date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
                    date.setHours(0, 0, 0, 0);
                    data.push({ date, amount: 0 });
                }

                // add the purchases to the data array
                for(let transaction of transactions) {
                    let date = new Date(transaction.createdAt.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if(index != -1) data[index].amount += transaction.amount;
                }

                // reverse the array so the newest date is first
                data.reverse();

                return res.json(data);
            });

            router.get("/:transactionId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let transactionId = parseId(req, res, "transactionId");
                let userId = parseId(req, res, "userId", req.user);
                if(!transactionId || transactionId == -1 || !userId || userId == -1) return;

                if(userId !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })

                const transaction = await server.database.transaction.findFirst({
                    where: {
                        id: transactionId,
                        userId
                    },
                    include: {
                        purchase: {
                            select: {
                                id: true,
                                productId: true,
                                transactionId: true,
                                product: {
                                    select: {
                                        title: true,
                                        bannerId: true,
                                        bannerUrl: true,
                                    }
                                }
                            }
                        }
                    }
                });

                if(!transaction) return res.status(404).json({ error: "Transaction not found" });
                
                if(transaction.type === TransactionType.PURCHASE && transaction.purchase) {
                    transaction.purchase.product.bannerUrl = getURL(transaction.purchase.product.bannerId, "images");}
                return res.json(transaction);
            });
            
            return router;
        }
    }
}