import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(!id || id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })

                let purchaseProducts = await server.database.purchase.findMany({
                    where: {
                        userId: id,
                        product: {
                            licensable: true,
                        }
                    },
                    select: {
                        product: {
                            select: {
                                id: true,
                                title: true,
                            }
                        }
                    }
                })

                let createdLicenses = await server.database.productLicense.findMany({
                    where: {
                        userId: id,
                    }
                })

                let licenses: {
                    product: {
                        id: number,
                        title: string,
                    },
                    license: {
                        id: number,
                        key: string,
                        lastUpdated: Date,
                    } | null
                }[] = [];

                purchaseProducts.forEach(purchaseProduct => {
                    let license = createdLicenses.find(license => license.productId === purchaseProduct.product.id);
                    if(license) {
                        licenses.push({
                            product: purchaseProduct.product,
                            license: {
                                id: license.id,
                                key: license.license,
                                lastUpdated: license.updatedAt,
                            }
                        })
                    } else {
                        licenses.push({
                            product: purchaseProduct.product,
                            license: null
                        })
                    }
                })

                return res.json(licenses);
            });

            router.put("/:productId", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let userId = parseId(req, res, "userId", req.user);
                let productId = parseId(req, res, "productId", req.user);
                if(!userId || userId === -1 || !productId || productId === -1) return;

                if(userId !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })

                let purchaseProduct = await server.database.purchase.findFirst({
                    where: {
                        userId: userId,
                        productId: productId,
                        product: {
                            licensable: true,
                        }
                    }
                })

                if(!purchaseProduct) return res.status(404).json({ error: "Product not found." });

                let newKey = uuidv4();
                newKey = newKey.substring(0, newKey.length - 13);

                await server.database.productLicense.deleteMany({
                    where: {
                        userId: userId,
                        productId: productId,
                    }
                })

                await server.database.productLicense.create({
                    data: {
                        userId: userId,
                        productId: productId,
                        license: newKey,
                    }
                })
                return res.json({ key: newKey });
            });
            
            return router;
        }
    }
}