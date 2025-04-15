import type Server from "@/interfaces/Server";
import { getURL } from "@/libs/r2";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/details", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                let { userId } = req.params as { userId: string | number };
                if(!userId) return res.status(400).send({ message: "Bad request" });
                if(typeof userId === "string" && userId.toLowerCase() === "@me" && req.user) userId = req.user.id;
                else {
                    try {
                        userId = parseInt(userId as string);
                    } catch {
                        return res.status(400).send({ message: "Bad request" });
                    }
                }
                if(req.user?.id !== userId && (req.user?.group || 4) > 1) 
                    return res.status(403).send({ message: "Forbidden" });

                const products = await server.database.product.findMany({
                    where: {
                        creatorId: userId
                    },
                    include: {
                        releases: {
                            orderBy: {
                                createdAt: "desc",
                            },
                            select: {
                                id: true,
                                title: true,
                                version: true,
                                status: true,
                                updatedAt: true,
                                createdAt: true,
                                statusUpdate: true,
                            },
                        },
                        _count: {
                            select: {
                                purchases: true,
                                favorites: true,
                            }
                        }
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                if(!products)
                    return res.status(500).send({ message: "Internal server error" });
                
                for(let product of products) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                }

                return res.status(200).send(products);
            });

            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                let { userId } = req.params as { userId: string | number };
                if(!userId) return res.status(400).send({ message: "Bad request" });
                if(typeof userId === "string" && userId.toLowerCase() === "@me" && req.user) userId = req.user.id;
                else {
                    try {
                        userId = parseInt(userId as string);
                    } catch {
                        return res.status(400).send({ message: "Bad request" });
                    }
                }
                const products = await server.database.product.findMany({
                    where: {
                        creatorId: userId
                    },
                    include: {
                        releases: {
                            take: 1,
                            orderBy: {
                                createdAt: "desc",
                            },
                            where: {
                                status: "APPROVED",
                            },
                            select: {
                                id: true,
                                title: true,
                                version: true,
                                updatedAt: true,
                                createdAt: true,
                            }
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                if(!products)
                    return res.status(500).send({ message: "Internal server error" });
                
                for(let product of products) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                    product.minecraftVersions = JSON.parse(product.minecraftVersions?.toString() || "[]");
                    product.tags = JSON.parse(product.tags?.toString() || "[]");
                }

                return res.status(200).send(products);
            });
            
            return router;
        }
    }
}