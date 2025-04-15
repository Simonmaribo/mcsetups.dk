import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { getURL } from "@/libs/r2";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let favorites = await server.database.userFavoriteProduct.findMany({
                    where: {
                        userId
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })

                return res.json(favorites);
            });

            router.get("/detailed", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;

                let favorites = await server.database.userFavoriteProduct.findMany({
                    where: {
                        userId,
                        product: {
                            public: true
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                bannerId: true,
                                bannerUrl: true,
                                createdAt: true,
                                updatedAt: true,
                                price: true,
                                sale: true,
                            }
                        }
                    }
                });

                for (const favorite of favorites) {
                    favorite.product.bannerUrl = getURL(favorite.product.bannerId, "images");
                }

                return res.json(favorites);
            });

            router.post("/:productId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let productId = parseId(req, res, "productId");
                if(!productId || productId == -1) return;

                let product = await server.database.product.findUnique({
                    where: {
                        id: productId
                    }
                });

                if(!product || (userId !== product.creatorId && product.public == false)) return res.status(404).json({ error: "Product not found" });

                let favorite = await server.database.userFavoriteProduct.findUnique({
                    where: {
                        userId_productId: {
                            userId,
                            productId
                        }
                    }
                });

                if(favorite) return res.status(400).json({ error: "Product already favorited" });

                await server.database.userFavoriteProduct.create({
                    data: {
                        userId,
                        productId
                    }
                });

                return res.json({ success: true });
            });

            router.delete("/:productId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                let productId = parseId(req, res, "productId");
                if(!productId || productId == -1) return;

                let favorite = await server.database.userFavoriteProduct.findUnique({
                    where: {
                        userId_productId: {
                            productId,
                            userId
                        }
                    }
                });

                if(!favorite) return res.status(404).json({ error: "Favorite not found" });

                if(favorite.userId !== userId) return res.status(403).json({ error: "You don't have permission to this." });

                await server.database.userFavoriteProduct.delete({
                    where: {
                        id: favorite.id
                    }
                });

                return res.json({ success: true });
            });
            
            return router;
        }
    }
}