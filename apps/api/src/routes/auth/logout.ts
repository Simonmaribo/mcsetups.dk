import Route from "@/interfaces/Route";
import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server): Route => {
    return {
        rateLimit: {
            max: 5,
            timePeriod: 60,
        },
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                server.authManager.deleteSession(req);
                return res.clearCookie("access_token").redirect(process.env.NODE_ENV === "production" ? "https://"+process.env.FRONTEND_DOMAIN : "http://127.0.0.1:3000");
            });
            
            return router;
        }
    }
}