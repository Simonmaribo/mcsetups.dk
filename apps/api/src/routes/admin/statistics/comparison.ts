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

                let data: { date: Date, 
                    argonClicks: number,
                    argonDownloads: number,
                    mcsetupsViews: number,
                    mcsetupsDownloads: number,
                }[] = [];

                for(let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
                    data.push({ date: new Date(date), argonClicks: 0, argonDownloads: 0, mcsetupsViews: 0, mcsetupsDownloads: 0 });
                }

                let argonStats = await server.database.argonTotalDailyStats.findMany({
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });

                let mcsetupsStats = await server.database.totalDailyProductStats.findMany({
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });

                for(let stat of argonStats) {
                    let date = new Date(stat.date.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if(index != -1) {
                        data[index].argonClicks += stat.clicks;
                        data[index].argonDownloads += stat.downloads;
                    }
                }

                for(let stat of mcsetupsStats) {
                    let date = new Date(stat.date.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if(index != -1) {
                        data[index].mcsetupsViews += stat.views;
                        data[index].mcsetupsDownloads += stat.downloads;
                    }
                }

                return res.json(data);
            });


            return router;
        }
    }
}