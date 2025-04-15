import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { updateRandomProducts } from "@/libs/functions/updateRandomProducts";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                await updateRandomProducts(server);
                return res.status(200).json({
                    success: true,
                    message: "Random products updated"
                });
            });

            return router;
        }
    }
}