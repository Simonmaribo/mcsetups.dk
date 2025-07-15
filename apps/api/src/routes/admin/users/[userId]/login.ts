import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import { Session } from "database";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {

            router.get("/", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized." });

                let userId = parseId(req, res, "userId");
                if(!userId || userId === -1) return;

                let user = await server.database.user.findFirst({
                    where: {
                        id: userId
                    }
                });

                if(!user) return res.status(404).json({ error: "User not found." });

                await server.authManager.generateNewSession(user.id, `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress}`, req.headers['user-agent'] || "Unknown")
                .then((session: Session) => {
                    server.authManager.setToken(res, session.token);
                    const returnToPage = (process.env.NODE_ENV === "production" ? "https://"+process.env.FRONTEND_DOMAIN : "http://127.0.0.1:3000");
                    return res.status(200).redirect(returnToPage);
                }).catch((err: any) => { return res.status(400).json({ error: err.message })});
                return;
            });

            return router;
        }
    }
}