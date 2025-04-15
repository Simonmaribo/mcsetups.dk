import { TransactionType } from 'database';
import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.put("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });
                let id = parseId(req, res, "productId");
                if(id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id,
                        public: true,
                    },
                    select: {
                        id: true,
                        creatorId: true,
                        price: true,
                        sale: true,
                        title: true,
                    }
                });
                if(!product) return res.status(404).json({ message: "Product not found" });

                if(req.user.id === product.creatorId) return res.status(403).json({ error: "Cannot buy your own products" });

                let price = product.sale >= 0 ? product.sale : product.price;
                
                
                if(req.user.balance < price) return res.status(403).json({ error: "Insufficient funds" });
                
                if(await server.database.purchase.findFirst({
                    where: {
                        userId: req.user.id,
                        productId: product.id
                    }
                })) return res.status(403).json({ error: "Already purchased" });

                await server.database.user.update({
                    where: {
                        id: req.user.id
                    },
                    data: {
                        balance: {
                            decrement: price
                        }
                    }
                });

                await server.database.tempBalance.create({
                    data: {
                        userId: product.creatorId,
                        amount: price,  
                        availableAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
                    }
                });

                await server.database.transaction.create({
                    data: {
                        userId: product.creatorId,
                        type: TransactionType.SALE,
                        amount: price,
                        productId: product.id
                    }
                });

                let purchaseTransaction = await server.database.transaction.create({
                    data: {
                        userId: req.user.id,
                        type: TransactionType.PURCHASE,
                        amount: price,
                        productId: product.id
                    }
                });

                await server.database.purchase.create({
                    data: {
                        userId: req.user.id,
                        productId: product.id,
                        transactionId: purchaseTransaction.id
                    }
                });

                res.status(200).json({ message: "Purchased" });

                server.notificationManager.sendNotification({
                    userId: product.creatorId,
                    type: "PRODUCT_SOLD",
                    metadata: {
                        productId: product.id,
                        productName: product.title,
                        buyerId: req.user.id,
                        buyerName: req.user.displayName,
                        buyerAvatar: req.user.avatarUrl,
                    }
                });

                return;
            });

            return router;
        }
    }
}