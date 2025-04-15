import type Server from "@/interfaces/Server";
import { getURL } from "@/libs/r2";
import type { Request, Response } from "express";
import { ProductStatus } from "database";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/pending", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {

                const releases = await server.database.productRelease.findMany({
                    where: {
                        status: "PENDING",
                    },
                    select: {
                        id: true,
                        title: true,
                        version: true,
                        createdAt: true,
                        statusUpdate: true,
                        product: {
                            select: {
                                id: true,
                                creatorId: true,
                                creator: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        avatarUrl: true,
                                    }
                                },
                                price: true,
                                type: true,
                                skriptVersion: true,
                                minecraftVersions: true,
                                createdAt: true,
                            },
                        }
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                if(!releases)
                    return res.status(500).send({ message: "Internal server error" });

                return res.status(200).send(releases);
            });

            router.get("/:releaseId", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                
                let releaseId = parseId(req, res, "releaseId");
                if(releaseId === -1) return;

                const release = await server.database.productRelease.findFirst({
                    where: {
                        id: releaseId,
                    },
                    select: {
                        id: true,
                        title: true,
                        version: true,
                        createdAt: true,
                        statusUpdate: true,
                        status: true,
                        changelog: true,
                        product: {
                            select: {
                                id: true,
                                creatorId: true,
                                creator: {
                                    select: {
                                        id: true,
                                        displayName: true,
                                        avatarUrl: true,
                                    }
                                },
                                price: true,
                                type: true,
                                description: true,
                                brief: true,
                                skriptVersion: true,
                                minecraftVersions: true,
                                createdAt: true,
                                bannerId: true,
                                bannerUrl: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                if(!release) return res.status(500).send({ message: "Release not found" });

                if(release.product.bannerId) {
                    release.product.bannerUrl = getURL(release.product.bannerId, "images");
                    release.product.minecraftVersions = JSON.parse(release.product.minecraftVersions?.toString() || "[]");
                }

                return res.status(200).send(release);
            });

            router.put("/:releaseId", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                
                let releaseId = parseId(req, res, "releaseId");
                if(releaseId === -1) return;

                const { status, comment } = req.body;
                if(!status) return res.status(400).send({ message: "Bad request" });
                if(status == ProductStatus.REJECTED && !comment) return res.status(400).send({ message: "Bad request" });
                
                if(!req?.user?.id) return res.status(402).send({ message: "Unauthorized" });

                const release = await server.database.productRelease.findFirst({
                    where: {
                        id: releaseId,
                    },
                    select: {
                        id: true,
                        title: true,
                        version: true,
                        product: {
                            select: {
                                creatorId: true,
                                id: true,
                            }
                        }
                    },
                });
                if(!release) return res.status(404).send({ message: "Not found" });

                await server.database.releaseStatusUpdate.create({
                    data: {
                        releaseId,
                        status: status,
                        message: comment,
                        changedById: req.user.id,
                    },
                });

                await server.database.productRelease.update({
                    where: {
                        id: releaseId,
                    },
                    data: {
                        status: status,
                    }
                });
                if(status == ProductStatus.APPROVED) {
                    await server.database.product.updateMany({
                        where: {
                            releases: {
                                some: {
                                    id: releaseId,
                                }
                            },
                            public: false,
                        },
                        data: {
                            public: true,
                        }
                    });
                }

                res.status(200).json({
                    message: "Updated release",
                })

                server.notificationManager.sendNotification({
                    userId: release.product.creatorId,
                    type: "PRODUCT_RELEASE_UPDATE",
                    metadata: {
                        productId: release.product.id,
                        releaseId: release.id,
                        releaseTitle: release.title,
                        releaseVersion: release.version,
                        statusUpdate: status,
                    }
                });

                return;
            });

            return router;
        }
    }
}