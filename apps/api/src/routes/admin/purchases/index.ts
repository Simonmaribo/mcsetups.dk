import type Server from "@/interfaces/Server";
import { PurchaseType } from "database";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {

            type PurchasesRequest = Request<{ page: number, limit: number }, {}, {}, { page: number, limit: number }>;

            router.get("/", server.authManager.ensureAuthorization(1), async (req: PurchasesRequest, res: Response) => {

                let { page = 1, limit = 15 } = req.query;
                if (typeof page !== "number") page = parseInt(page);
                if (typeof limit !== "number") limit = parseInt(limit);

                if (limit > 25) limit = 25;
                if (page < 1) page = 1;

                const queriedPurchases = await server.database.purchase.findMany({
                    where: {
                        type: PurchaseType.PURCHASE
                    },
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                discordName: true,
                                discordId: true,
                                avatarUrl: true,
                            }
                        },
                        product: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                creator: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        discordName: true,
                                        discordId: true,
                                        avatarUrl: true,
                                    }
                                }
                            }
                        },
                        transaction: {
                            select: {
                                id: true,
                                amount: true,
                            }
                        },
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                let total = queriedPurchases.length;
                let pages = Math.ceil(total / limit);
                if (page > pages) page = pages;
                else if (page < 1) page = 1;

                let purchases = queriedPurchases.slice((page - 1) * limit, page * limit);

                return res.status(200).send({
                    purchases,
                    total,
                    pages,
                    currentPage: page,
                });
            });

            return router;
        }
    }
}