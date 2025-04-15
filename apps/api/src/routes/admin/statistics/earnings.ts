import { PaypalOrderStatus } from 'database';
import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            
            router.get("/graph", server.authManager.ensureAuthorization(0), async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let { startDate, endDate } = req.query as { startDate: string | Date, endDate: string | Date };

                if(!startDate || !endDate){
                    // set default dates (start and end of the current month)
                    startDate = new Date();
                    startDate.setDate(0);
                    endDate = new Date();
                    endDate.setDate(0);
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    startDate = new Date(startDate);
                    endDate = new Date(endDate);
                }
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                console.log(startDate, endDate);

                let data: { date: Date, amount: number, netVolume: number, grossVolume: number }[] = [];
                // add all dates to the data array with 0 profit
                for(let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
                    data.push({ date: new Date(date), amount: 0, netVolume: 0, grossVolume: 0 });
                }

                let deposits = await server.database.paypalOrder.findMany({
                    where: {
                        status: PaypalOrderStatus.COMPLETED,
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });

                // add the profits to the data array
                for(let deposit of deposits) {
                    let date = new Date(deposit.createdAt.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if(index != -1) {
                        let profit = deposit.platformProfit;

                        let withdrawFee = profit * 0.029 + 260;
                        data[index].netVolume += (profit - withdrawFee)
                        data[index].grossVolume += profit;
                        data[index].amount += deposit.amount;
                    }
                }

                // go throught data and toFixed(2) all values
                for(let i = 0; i < data.length; i++) {
                    data[i].netVolume = parseFloat(data[i].netVolume.toFixed(2));
                    data[i].grossVolume = parseFloat(data[i].grossVolume.toFixed(2));
                }
                return res.json({
                    data,
                    totalNetVolume: data.reduce((a, b) => a + b.netVolume, 0),
                    totalGrossVolume: data.reduce((a, b) => a + b.grossVolume, 0),
                    totalAmount: data.reduce((a, b) => a + b.amount, 0)
                });
            });


            return router;
        }
    }
}