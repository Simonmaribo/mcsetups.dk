import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/", async (req: Request, res: Response) => {

                const products = await server.database.product.findMany({
                    where: {
                        public: true,
                    },
                    select: {
                        id: true,
                        title: true,
                        updatedAt: true,
                        createdAt: true,
                    },
                });

                return res.status(200).send(products);
            });

            return router;
        }
    }
}