import { ProductStatus } from 'database';
import type Server from "@/interfaces/Server";
import { generateSignedUrl } from "@/libs/r2";
import type { Request, Response } from "express";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/download", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "releaseId");
                if(id === -1) return;


                let release = await server.database.productRelease.findFirst({
                    where: {
                        id,
                    },
                    select: {
                        id: true,
                        resourceId: true,
                        product: {
                            select: {
                                id: true,
                                price: true,
                                creator: {
                                    select: {
                                        id: true,
                                    }
                                }
                            }
                        },
                    }
                });
                if(!release) return res.status(404).json({ error: "Release not found" });

                let hasAccess = false;
                if(release.product.creator.id == req.user.id) hasAccess = true;
                else if(req.user.group <= 1) hasAccess = true;
                else if(release.product.price <= 0) hasAccess = true;
                else {
                    let access = await server.database.purchase.findFirst({
                        where: {
                            productId: release.product.id,
                            userId: req.user.id
                        }
                    });
                    if(access) hasAccess = true;
                }

                if(!hasAccess) return res.status(403).json({ error: "Forbidden" });

                res.redirect(await generateSignedUrl(release.resourceId, "resources"));

                await server.database.productDownload.create({
                    data: {
                        releaseId: release.id,
                        productId: release.product.id,
                        userId: req.user.id,
                        ipAddress: `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress}`,
                        device: req.headers['user-agent'] || "Unknown",
                    }
                });

                if(release.product.creator.id != req.user.id){
                    await server.database.product.update({
                        where: {
                            id: release.product.id
                        },
                        data: {
                            estimatedDownloads: {
                                increment: 1
                            }
                        }
                    });
                }

                return;
            });

            router.get("/", server.authManager.includeUser, async (req: Request, res: Response) => {
                let id = parseId(req, res, "releaseId");
                if(id === -1) return;

                let release = await server.database.productRelease.findFirst({
                    where: {
                        id,
                    },
                    select: {
                        id: true,
                        title: true,
                        version: true,
                        resourceSize: true,
                        changelog: true,
                        product: {
                            select: {
                                creatorId: true,
                            }
                        },
                        createdAt: true,
                        updatedAt: true,
                        status: true,
                        statusUpdate: true
                    }
                });

                if(!release) return res.status(404).json({ error: "Release not found" });

                let hasAccess = false;
                if(req.user){
                    if(release.product.creatorId == req.user?.id) hasAccess = true;
                    else if(req.user?.group <= 1) hasAccess = true;
                }
                if(!hasAccess && release.status != ProductStatus.APPROVED) return res.status(403).json({ error: "Forbidden" });

                return res.json({
                    ...release,
                    statusUpdate: hasAccess ? release.statusUpdate : null,
                })
            });

            router.delete("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });
                
                let id = parseId(req, res, "releaseId");
                if(!id || id === -1) return;

                let release = await server.database.productRelease.findFirst({
                    where: {
                        id,
                        status: {
                            not: ProductStatus.APPROVED
                        }
                    },
                    select: {
                        id: true,
                        product: {
                            select: {
                                id: true,
                                creatorId: true,
                            }
                        }
                    }
                });

                if(!release) return res.status(404).json({ error: "Release not found" });

                if(release.product.creatorId != req.user.id && req.user.group > 1) return res.status(403).json({ error: "Forbidden" });

                await server.database.productRelease.deleteMany({
                    where: {
                        id
                    }
                });

                let product = await server.database.product.findFirst({
                    where: {
                        id: release.product.id
                    },
                    select: {
                        id: true,
                        releases: {
                            select: {
                                id: true,
                            }
                        }
                    }
                });

                if(product?.releases.length == 0){
                    await server.database.product.update({
                        where: {
                            id: product.id
                        },
                        data: {
                            public: false
                        }
                    });
                }

                return res.json({ message: "Release deleted" });
            });
            
            return router;
        }
    }
}