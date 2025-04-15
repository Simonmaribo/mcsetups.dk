import Route from "@/interfaces/Route";
import type Server from "@/interfaces/Server";
import type { Request, Response } from "express";
import { Session } from "database";

import DiscordOauth2 from "discord-oauth2";
import OAuth from "discord-oauth2";

const router = require("express").Router({ mergeParams: true });

module.exports = (server: Server): Route => {

    const oauth = new DiscordOauth2({
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: (process.env.NODE_ENV == 'production' ? 'https://' + process.env.DOMAIN : 'http://127.0.0.1:' + process.env.PORT) + process.env.DISCORD_REDIRECT_URI,
    })

    return {
        rateLimit: {
            max: 10,
            timePeriod: 60,
        },
        router: () => {
            router.get("/", server.authManager.forwardAuthentication, async (req: Request, res: Response) => {
                const { page, prompt } = req.query;

                let pagePrompt: "consent" | "none" = prompt ? "consent" : "none";

                if(page) return res.redirect(oauth.generateAuthUrl({ scope: ["identify", "email"], prompt: pagePrompt, state: `${page}` }));
                return res.redirect(oauth.generateAuthUrl({ scope: ["identify", "email"], prompt: pagePrompt }));
            });

            router.get("/callback", async (req: Request, res: Response) => {
                if(!req.query.code) return res.status(400).json({ error: "No code provided." });
                if(typeof req.query.code !== "string") return res.status(400).json({ error: "Invalid code provided." });
                
                const returnToPage = req.query.state ? `${req.query.state}` : (process.env.NODE_ENV === "production" ? "https://"+process.env.FRONTEND_DOMAIN : "http://127.0.0.1:3000");

                let response: OAuth.TokenRequestResult;
                try {
                    response = await oauth.tokenRequest({
                        code: req.query.code,
                        scope: ["identify", "email"],
                        grantType: "authorization_code"
                    })
                } catch (err) {
                    return res.json({ error: err.message })
                }

                if(!response || !response.access_token) return res.status(400).json({ error: "No response from Discord." });
                let discordUser: OAuth.User;
                try {
                    discordUser = await oauth.getUser(response.access_token)
                    if(!discordUser) return res.status(400).json({ error: "No response from Discord." });
                    if(!discordUser.id || !discordUser.email || !discordUser.username) {
                        console.log(discordUser)
                        return res.redirect((process.env.NODE_ENV === "production" ? "https://"+process.env.FRONTEND_DOMAIN : "http://127.0.0.1:3000")+"/errors/login")
                        //return res.status(400).json({ error: "Invalid response from Discord." });
                    }
                } catch (err) {
                    return res.json({ error: err.message })
                }

                let user = await server.database.user.findFirst({
                    where: {
                        discordId: discordUser.id
                    }
                })

                if(!user){
                    // get available username 16 characters
                    try {
                        var username = `${discordUser?.username}`.substring(0, 16);
                        while(await server.database.user.findFirst({
                            where: {
                                displayName: username
                            }
                        })){
                            let remaining = `${discordUser.username}`.substring(0, 12);
                            username = `${remaining}${Math.floor(Math.random() * 9999)}`.substring(0, 16);
                        }
                    } catch (err) {
                        console.error(err);
                        return res.json({ error: err.message })
                    }

                    await server.database.user.create({
                        data: {
                            discordId: discordUser.id,
                            discordName: discordUser?.discriminator ? (`${discordUser.username}#${discordUser.discriminator}`) : discordUser.username,
                            displayName: username,
                            avatarUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : `https://mcsetups.dk/default.png`,
                            email: `${discordUser.email}`,
                        }
                    })
                    .then(async (newUser: any) => {
                        await server.authManager.generateNewSession(newUser.id, `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress}`, req.headers['user-agent'] || "Unknown")
                        .then((session: Session) => {
                            server.authManager.setToken(res, session.token);
                            return res.status(200).redirect(returnToPage);
                        }).catch((err: any) => { return res.status(400).json({ error: err.message })});
                    })
                    .catch((err: any) => { return res.status(400).json({ error: err.message })});
                } else {
                    await server.database.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            discordName: `${discordUser.username}#${discordUser.discriminator}`,
                            avatarUrl: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : `https://mcsetups.dk/default.png`,
                            lastLogin: new Date(),
                            email: `${discordUser.email}`,
                        }
                    })
                    .then(async (updatedUser: any) => {
                        await server.authManager.generateNewSession(updatedUser.id, `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress}`, req.headers['user-agent'] || "Unknown")
                        .then((session: Session) => {
                            server.authManager.setToken(res, session.token);
                            return res.status(200).redirect(returnToPage);
                        }).catch((err: any) => { return res.status(400).json({ error: err.message })});
                    })
                    .catch((err: any) => { return res.status(400).json({ error: err.message })});
                }
            });

            
            return router;
        }
    }
}