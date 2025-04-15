import type Server from "@/interfaces/Server";
import { updateProductsPopularity } from "@/libs/functions/updateProductsPopularity";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                await updateProductsPopularity(server);
                return res.status(200).json({
                    success: true,
                    message: "Top products updated"
                });
            });

            return router;
        }
    }
}