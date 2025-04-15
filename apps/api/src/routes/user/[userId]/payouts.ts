import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

const PAYOUT_FEES = 0.15;

module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(!id || id === -1) return;

                if(id !== req.user.id && req.user.group > 1) return res.status(403).json({ error: "You don't have permission to this." })


                let payouts = await server.database.payout.findMany({
                    where: {
                        userId: id
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                });

                return res.json(payouts);
            });

            router.post("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "userId", req.user);
                if(!id || id === -1) return;
                if(id !== req.user.id) return res.status(403).json({ error: "You don't have permission to this." })

                let { amount } = req.body;
                if(!amount) return res.status(400).json({ error: "Amount is required." });
                if(amount < 2500) return res.status(400).json({ error: "Beløbet skal være større end 25 DKK" });

                let user = await server.database.user.findUnique({
                    where: {
                        id
                    },
                    select: {
                        balance: true
                    }
                });

                if(!user) return res.status(404).json({ error: "User not found." });
                if(user.balance < amount) return res.status(400).json({ error: "Du har ikke penge til dette." });

                await server.database.user.update({
                    where: {
                        id
                    },
                    data: {
                        balance: {
                            decrement: amount
                        }
                    }
                });

                let pendingPayouts = await server.database.payout.findMany({
                    where: {
                        userId: id,
                        status: "PENDING"
                    }
                });

                if(pendingPayouts.length > 0) return res.status(400).json({ error: "Du har allerede en afventende udbetaling." });

                let transaction = await server.database.transaction.create({
                    data: {
                        userId: id,
                        amount: amount,
                        type: "PAYOUT",
                    }
                });

                let payout = await server.database.payout.create({
                    data: {
                        userId: id,
                        amount: amount - (amount * PAYOUT_FEES),
                        fee: amount * PAYOUT_FEES,
                        status: "PENDING",
                        transactionId: transaction.id
                    }
                });

                return res.json(payout);
            
            });

            return router;
        }
    }
}