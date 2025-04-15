import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { parseId } from "@/libs/utils";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/pending", server.authManager.ensureAuthorization(0), async (req: Request, res: Response) => {

                let payouts = await server.database.payout.findMany({
                    where: {
                        status: "PENDING"
                    },
                    include: {
                        user: {
                            select: {
                                discordName: true,
                                discordId: true,
                                displayName: true,
                                email: true,
                                avatarUrl: true,
                                id: true,
                                integrations: {
                                    select: {
                                        id: true,
                                        type: true,
                                        data: true
                                    },
                                    where: {
                                        type: "PAYPAL"
                                    }
                                }
                            },
                        }
                    }
                });
        
                return res.status(200).send(payouts);
            });

            router.put("/:payoutId/complete", server.authManager.ensureAuthorization(0), async (req: Request, res: Response) => {
                let payoutId = parseId(req, res, "payoutId");
                if(!payoutId || payoutId === -1) return;

                let { transactionId } = req.body;
                if(!transactionId) return res.status(400).json({ error: "Missing parameters." });

                let payout = await server.database.payout.findFirst({
                    where: {
                        id: payoutId
                    },
                });

                if(!payout) return res.status(404).json({ error: "Payout not found." });

                if(payout.status !== "PENDING") return res.status(400).json({ error: "Payout is not pending." });

                await server.database.payout.update({
                    where: {
                        id: payoutId
                    },
                    data: {
                        status: "COMPLETED",
                        paypalTransactionId: transactionId,
                        updatedAt: new Date()
                    }
                });

                return res.status(200).json({ message: "Payout completed." });
            });

            return router;
        }
    }
}