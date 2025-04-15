import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {

            type Users = Request<{ page: number, limit: number, search: string }, {}, {}, { page: number, limit: number, search: string, }>;

            router.get("/list", async (req: Users, res: Response) => {

                let { page = 1, limit = 10, search = "" } = req.query;
                if (typeof page !== "number") page = parseInt(page);
                if (typeof limit !== "number") limit = parseInt(limit);

                if (limit > 25) limit = 25;
                if (page < 1) page = 1;

                const queriedUsers = await server.database.user.findMany({
                    where: {
                        OR: [
                            { displayName: { contains: search } },
                            { discordName: { contains: search } },
                        ],
                        verified: true,
                    },
                    select: {
                        id: true,
                        displayName: true,
                        discordName: true,
                        discordId: true,
                        createdAt: true,
                        verified: true,
                        group: true,
                        avatarUrl: true,
                        _count: {
                            select: {
                                products: {
                                    where: {
                                        public: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        group: "asc",
                    }
                });

                let total = queriedUsers.length;
                let pages = Math.ceil(total / limit);
                if (page > pages) page = pages;
                else if (page < 1) page = 1;

                let users = queriedUsers.slice((page - 1) * limit, page * limit);

                return res.status(200).send({
                    users,
                    total,
                    pages,
                    currentPage: page,
                });
            });

            return router;
        }
    }
}