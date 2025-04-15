import type Server from "@/interfaces/Server";
import { getURL } from "@/libs/r2";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", async (req: Request, res: Response) => {
                const topProducts = await server.database.product.findMany({
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        sale: true,
                        bannerId: true,
                        bannerUrl: true,
                        type: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    where: {
                        public: true,
                        price: {
                            gt: 0
                        }
                    },
                    orderBy: {
                        popularity: "asc",
                    },
                    take: 10,
                });

                for(const product of topProducts) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                }

                const randomProducts = await server.database.product.findMany({
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        sale: true,
                        bannerId: true,
                        bannerUrl: true,
                        type: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    where: {
                        public: true,
                        randomFeatured: true
                    },
                })

                for(const product of randomProducts) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                }


                return res.json({
                    topProducts,
                    randomProducts
                });
            });

            return router;
        }
    }
}