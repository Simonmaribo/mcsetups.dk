import type Server from "@/interfaces/Server";
import { parseId } from "@/libs/utils";
import type { Request, Response } from "express";
import { getURL } from "@/libs/r2";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server) => {
    return {
        router: () => {
            router.put("/", server.authManager.ensureAuthentication, async (req: Request, res: Response) => {
                if(!req.user) return res.status(401).json({ error: "Unauthorized." });
                let userId = parseId(req, res, "userId", req.user);
                if(!userId || userId == -1) return;
                if(userId !== req.user.id && req.user.group > 0) return res.status(403).json({ error: "You don't have permission to this." });

                if(!req.body) return res.status(400).json({ error: "No body provided." });
                if(typeof req.body !== "object") return res.status(400).json({ error: "Invalid body provided." });

                let { displayName, description, emailNotifications } = req.body;

                if(!displayName) return res.status(400).json({ error: "No display name provided." });
                if(!description && description !== '') return res.status(400).json({ error: "No description provided." });
                if(!emailNotifications && emailNotifications !== false) return res.status(400).json({ error: "No email notifications provided." });
                 
                if(displayName.length > 16) return res.status(400).json({ error: "Brugernavnet er for langt." });
                if(displayName.length < 3) return res.status(400).json({ error: "Brugernavnet er for kort." });
                if(!displayName.match(/^[a-zA-Z0-9_]+$/)) return res.status(400).json({ error: "Brugernavnet indeholder ugyldige tegn." });
                if(description.length > 100) return res.status(400).json({ error: "Beskrivelsen er for lang." });
                if(typeof emailNotifications !== "boolean") return res.status(400).json({ error: "Email notifications er ikke en boolean." });

                let user = await server.database.user.findFirst({
                    where: {
                        id: userId,
                        verified: true
                    }
                });

                if(!user) return res.status(404).json({ error: "User not found." });

                if(
                    user.displayName == displayName 
                    && user.description == description
                    && user.emailNotifications == emailNotifications
                    ) return res.status(400).json({ error: "Ingen ændringer lavet." });
                if(user.displayName.toLowerCase() != displayName.toLowerCase() && await server.database.user.findFirst({ where: { displayName } })) return res.status(400).json({ error: "Brugernavnet er allerede i brug." });

                await server.database.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        displayName,
                        description,
                        emailNotifications
                    }
                });

                return res.json({ success: true });
            });

            router.get("/public", server.authManager.includeUser, async (req: Request, res: Response) => {
                let username = req.params["userId"] as string;
                if(!username) return res.status(400).json({ error: "No username provided." });

                let user = await server.database.user.findFirst({
                    where: {
                        displayName: username
                    },
                    select: {
                        id: true,
                        displayName: true,
                        description: true,
                        discordName: true,
                        avatarUrl: true,
                        createdAt: true,
                        verified: true,
                        products: {
                            select: {
                                id: true,
                                title: true,
                                public: true,
                                brief: true,
                                price: true,
                                sale: true,
                                bannerId: true,
                                bannerUrl: true,
                                type: true,
                            },
                        }
                    }
                });

                if(!user) return res.status(404).json({ error: "Brugeren blev ikke fundet." });

                if(!req.user || (req.user.id !== user.id && req.user.group > 1)) {
                    user.products = user.products.filter(product => product.public);
                }
                
                for(let product of user.products) {
                    product.bannerUrl = getURL(product.bannerId, "images");
                }

                return res.json(user);
            });
            
            return router;
        }
    }
}