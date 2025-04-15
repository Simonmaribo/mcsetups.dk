import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { parseId } from '@/libs/utils';

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            
            router.get("/graph", server.authManager.ensureAuthorization(0), async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "productId");
                if(id === -1) return;
                
                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if(!product) return res.status(404).json({ error: "Product not found" });
                if(req.user.id != product.creatorId && req.user.group > 1) return res.status(403).json({ error: "Forbidden" });
                
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

                let data: {
                     date: Date, 
                     views: number,
                     purchases: number,
                     downloads: number 
                }[] = [];

                // add all dates to the data array with 0 profit
                for(let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
                    data.push({ date: new Date(date), views: 0, purchases: 0, downloads: 0 });
                }

                
                let stats = await server.database.productHistoryStat.findMany({
                    where: {
                        productId: id,
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });

                for(let stat of stats) {
                    let date = new Date(stat.date.getTime());
                    date.setHours(0, 0, 0, 0);
                    let index = data.findIndex(d => d.date.getTime() == date.getTime());
                    if(index != -1) {
                        data[index].views += stat.views;
                        data[index].purchases += stat.purchases;
                        data[index].downloads += stat.downloads;
                    }
                }

                return res.json(data);
            });

            router.get("/graph/individual", server.authManager.ensureAuthorization(0), async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized" });

                let id = parseId(req, res, "productId");
                if(id === -1) return;
                
                let product = await server.database.product.findFirst({
                    where: {
                        id
                    },
                    select: {
                        id: true,
                        creatorId: true,
                    }
                });

                if(!product) return res.status(404).json({ error: "Product not found" });
                if(req.user.id != product.creatorId && req.user.group > 1) return res.status(403).json({ error: "Forbidden" });
                
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

                let data: {
                     date: Date, 
                     views: number,
                     purchases: number,
                     downloads: number 
                }[] = [];

                // add all dates to the data array with 0 profit
                for(let date = new Date(startDate); date <= new Date(endDate); date.setDate(date.getDate() + 1)) {
                    data.push({ date: new Date(date), views: 0, purchases: 0, downloads: 0 });
                }

                let stats = await server.database.productHistoryStat.findMany({
                    where: {
                        productId: id,
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    orderBy: {
                        date: "asc"
                    }
                });

                // for each day subtract the previous day's stats to get the individual stats
                for(let i = 0; i <= stats.length; i++) {
                    if(!stats[i-1] || !stats[i]) {
                        continue;
                    }

                    data[i].views = stats[i].views - stats[i - 1].views;
                    data[i].purchases = stats[i].purchases - stats[i - 1].purchases;
                    data[i].downloads = stats[i].downloads - stats[i - 1].downloads;
                }
 
                return res.json(data);
            });


            return router;
        }
    }
}