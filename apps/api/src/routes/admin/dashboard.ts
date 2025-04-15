import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


module.exports = (server: Server) => {
    return {
        router: () => {
            router.get("/stats", server.authManager.ensureAuthorization(1), async (req: Request, res: Response) => {

                let users = await server.database.user.count();
                let activeUsersThisMonth = await server.database.user.count({
                    where: {
                        lastLogin: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                });
                // get all the users who in this month (not 30 days, but this month)
                let newThisMonth = await server.database.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                });
                let newPreviousMonth = await server.database.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                            lte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                });

                let balances = await server.database.user.findMany({
                    select: {
                        balance: true
                    },
                    where: {
                        balance: {
                            gt: 0
                        }
                    }
                });

                let tempBalances = await server.database.tempBalance.findMany({
                    select: {
                        amount: true
                    },
                });

                let totalBalance = balances.reduce((a, b) => a + b.balance, 0);
                let tempTotalBalance = tempBalances.reduce((a, b) => a + b.amount, 0);


                return res.status(200).send({
                    user: {
                        total: users,
                        activeThisMonth: activeUsersThisMonth,
                        newThisMonth: newThisMonth,
                        newPreviousMonth: newPreviousMonth
                    },
                    balance: {
                        total: totalBalance+tempTotalBalance,
                        totalBalance: totalBalance,
                        tempTotal: tempTotalBalance
                    }
                });
            });
            
            return router;
        }
    }
}