import { ProductStatus } from 'database';
import type Server from "@/interfaces/Server";
import { generateSignedUrl, getURL } from "@/libs/r2";
import type { Request, Response } from "express";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.includeUser, async (req: Request, res: Response) => {
                let id = parseId(req, res, "productId");
                if (!id || id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id,
                    },
                    select: {
                        id: true,
                        public: true,
                        creator: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                                verified: true,
                                description: true,
                            }
                        },
                        releases: {
                            select: {
                                id: true,
                                title: true,
                                version: true,
                                resourceSize: true,
                                createdAt: true,
                            },
                            orderBy: {
                                createdAt: "desc"
                            },
                            where: {
                                status: ProductStatus.APPROVED
                            }
                        },
                        title: true,
                        description: true,
                        brief: true,
                        price: true,
                        sale: true,
                        type: true,
                        skriptVersion: true,
                        minecraftVersions: true,
                        tags: true,
                        bannerId: true,
                        bannerUrl: true,

                        updatedAt: true,
                        createdAt: true,
                    }
                });

                if (!product) return res.status(404).json({ error: "Product not found" });

                let access = false;
                if (product.public) access = true;
                else if (req?.user?.group || 4 <= 1) access = true;
                else if (req?.user?.id == product.creator.id) access = true;

                if (!access) return res.status(403).json({ error: "Forbidden" });

                product.bannerUrl = getURL(product.bannerId, "images");
                product.minecraftVersions = JSON.parse(product.minecraftVersions?.toString() || "[]");
                product.tags = JSON.parse(product.tags?.toString() || "[]");
                res.json(product);

                if (req.query.addView && (req?.user?.id != product.creator.id || !req?.user?.id)) {
                    await server.database.product.update({
                        where: {
                            id: product.id
                        },
                        data: {
                            estimatedViews: {
                                increment: 1
                            }
                        }
                    });
                }

                return;
            });

            router.get("/download", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "productId");
                if (id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id,
                    },
                    select: {
                        creatorId: true,
                        price: true,
                        sale: true,
                        releases: {
                            select: {
                                id: true,
                                resourceId: true,
                            },
                            where: {
                                status: ProductStatus.APPROVED
                            },
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 1
                        },
                    }
                });
                if (!product) return res.status(404).json({ error: "Product not found" });
                if (!product.releases[0]) return res.status(404).json({ error: "No releases found" });

                let hasAccess = false;
                let price = product.sale >= 0 ? product.sale : product.price;
                if (product.creatorId == req.user.id) hasAccess = true;
                else if (req.user.group <= 1) hasAccess = true;
                else if (price == 0 || product.price <= 0) hasAccess = true;
                else {
                    let access = await server.database.purchase.findFirst({
                        where: {
                            productId: id,
                            userId: req.user.id
                        }
                    });
                    if (access) hasAccess = true;
                }

                if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

                res.redirect(await generateSignedUrl(product.releases[0].resourceId, "resources"));

                await server.database.productDownload.create({
                    data: {
                        releaseId: product.releases[0].id,
                        productId: id,
                        userId: req.user.id,
                        ipAddress: `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress}`,
                        device: req.headers['user-agent'] || "Unknown",
                    }
                });
                if (product.creatorId != req.user.id)
                    await server.database.product.update({
                        where: {
                            id
                        },
                        data: {
                            estimatedDownloads: {
                                increment: 1
                            }
                        }
                    });
                return
            });

            router.get("/access/:userId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });

                let productId = parseId(req, res, "productId");
                let userId = parseId(req, res, "userId", req.user);
                if (!productId || !userId || productId === -1 || userId === -1) return;

                let purchase = await server.database.purchase.findFirst({
                    where: {
                        productId,
                        userId
                    }
                });
                if (!purchase) {
                    let product = await server.database.product.findFirst({
                        where: {
                            id: productId
                        },
                        select: {
                            creatorId: true,
                            price: true,
                            sale: true,
                        }
                    });
                    if (!product) return res.status(404).json({ error: "Product not found" });
                    if (product.creatorId == userId) return res.json({ access: true });

                    let price = product.sale >= 0 ? product.sale : product.price;
                    if (product.price <= 0 || price == 0) return res.json({ access: true });
                    if (req.user.group <= 0) return res.json({ access: true });

                    return res.json({ access: false });
                } else return res.json({ access: true });
            });

            router.get("/simple", server.authManager.includeUser, async (req: Request, res: Response) => {
                let id = parseId(req, res, "productId");
                if (!id || id === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id,
                    },
                    select: {
                        id: true,
                        creatorId: true,
                        public: true,
                        title: true,
                        brief: true,
                        price: true,
                        sale: true,
                        type: true,
                        skriptVersion: true,
                        minecraftVersions: true,
                        tags: true,
                        bannerId: true,
                        bannerUrl: true,
                        updatedAt: true,
                        createdAt: true,
                    }
                });
                if (!product) return res.status(404).json({ error: "Product not found" });
                let access = false;
                if (product.public) access = true;
                else if (req?.user?.group || 4 <= 1) access = true;
                else if (req?.user?.id == product.creatorId) access = true;

                if (!access) return res.status(403).json({ error: "Forbidden" });

                product.bannerUrl = getURL(product.bannerId, "images");
                product.minecraftVersions = JSON.parse(product.minecraftVersions?.toString() || "[]");
                product.tags = JSON.parse(product.tags?.toString() || "[]");
                return res.json(product);
            });

            router.get("/detailed", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if (!req.user) return res.status(401).json({ error: "Unauthorized" });

                let productId = parseId(req, res, "productId");
                if (productId === -1) return;

                let product = await server.database.product.findFirst({
                    where: {
                        id: productId
                    },
                    select: {
                        id: true,
                        public: true,
                        title: true,
                        description: true,
                        price: true,
                        sale: true,
                        type: true,
                        skriptVersion: true,
                        minecraftVersions: true,
                        bannerId: true,
                        bannerUrl: true,
                        createdAt: true,
                        updatedAt: true,
                        tags: true,
                        creator: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                                verified: true,
                                group: true
                            }
                        },
                        releases: {
                            select: {
                                id: true,
                                title: true,
                                version: true,
                                resourceSize: true,
                                createdAt: true,
                                status: true,
                            },
                            orderBy: {
                                createdAt: "desc"
                            },
                        },
                    },
                });

                if (!product) return res.status(404).json({ error: "Product not found" });

                let access = false;
                if (product.public) access = true;
                else if (req?.user?.group || 4 <= 1) access = true;
                else if (req?.user?.id == product.creator.id) access = true;

                if (!access) return res.status(403).json({ error: "Forbidden" });

                product.bannerUrl = getURL(product.bannerId, "images");
                product.minecraftVersions = JSON.parse(product.minecraftVersions?.toString() || "[]");
                product.tags = JSON.parse(product.tags?.toString() || "[]");
                return res.json(product);
            });

            return router;
        }
    }
}