import type Server from "@/interfaces/Server";
import { getURL } from "@/libs/r2";
import { ProductType } from "database";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });


export type Filters = {
    types: ProductType[];
}

export const stringToFilter = (str: string): Filters => {
    const filters: Filters = { types: [] };
    const split = str.split(',');
    split.forEach((filter) => {
        const split = filter.split(':');
        if(split[0] === 'type'){
            filters.types.push(split[1] as ProductType);
        }
    });
    return filters;
}


module.exports = (server: Server) => {
    return {
        router: () => {

            type Products = Request<{ page: number, limit: number, filters: string, search: string, sort: string }, {}, {}, { page: number, limit: number, filters: string, search: string, sort: string }>;

            router.get("/", server.authManager.ensureAuthorization(1), async (req: Products, res: Response) => {

                let { page = 1, limit = 10, search = "", filters = '', sort = 'popularity' } = req.query;
                if (typeof page !== "number") page = parseInt(page);
                if (typeof limit !== "number") limit = parseInt(limit);

                if (limit > 25) limit = 25;
                if (page < 1) page = 1;

                const parsedFilters = stringToFilter(filters);
                if(parsedFilters.types.length === 0) parsedFilters.types.push('PLUGIN', 'SKRIPT', 'MAP', 'SETUP', 'OTHER');

                const sortingType = (() => {
                    switch(sort){
                        case 'popularity': return { popularity: 'asc' };
                        case 'newest': return { createdAt: 'desc' };
                        case 'oldest': return { createdAt: 'asc' };
                        case 'lowestPrice': return { price: 'asc' };
                        case 'highestPrice': return { price: 'desc' };
                        case 'mostViews': return { estimatedViews: 'desc' };
                        case 'leastViews': return { estimatedViews: 'asc' };
                        case 'mostDownloads': return { estimatedDownloads: 'desc' };
                        case 'leastDownloads': return { estimatedDownloads: 'asc' };

                        default: return { popularity: 'asc' };
                    }
                })()

                const queriedProducts = await server.database.product.findMany({
                    where: {
                        OR: [
                            { title: { contains: search } },
                            { brief: { contains: search } },
                        ],
                        type: {
                            in: parsedFilters.types,
                        },
                    },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        public: true,
                        bannerId: true,
                        bannerUrl: true,
                        createdAt: true,
                        updatedAt: true,
                        price: true,
                        estimatedDownloads: true,
                        estimatedViews: true,
                        sale: true,
                        _count: {
                            select: {
                                purchases: true,
                            }
                        },
                    },
                    orderBy: sortingType as any,
                });

                if(sort == 'mostSales' || sort == 'leastSales') 
                    queriedProducts.sort((a, b) => {
                        if(sort == 'mostSales') return b._count.purchases - a._count.purchases;
                        else return a._count.purchases - b._count.purchases;
                    });

                let total = queriedProducts.length;
                let pages = Math.ceil(total / limit);
                if (page > pages) page = pages;
                else if (page < 1) page = 1;

                if(sortingType.price) {
                    queriedProducts.sort((a, b) => {
                        let aPrice = a.sale >= 0 ? a.sale : a.price;
                        let bPrice = b.sale >= 0 ? b.sale : b.price;

                        if(sortingType.price === 'asc') return aPrice - bPrice;
                        else return bPrice - aPrice;
                    });
                }

                let products = queriedProducts.slice((page - 1) * limit, page * limit);

                for (const product of products) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                }

                return res.status(200).send({
                    products,
                    total,
                    pages,
                    currentPage: page,
                });
            });

            return router;
        }
    }
}