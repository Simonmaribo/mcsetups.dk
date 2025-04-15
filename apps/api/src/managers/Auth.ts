import type AuthManager from "@/interfaces/managers/AuthManager";
import { PrismaClient, Session, User } from "database";
import { Request, Response, NextFunction } from "express";

const jwt = require('jsonwebtoken');

module.exports = (db: PrismaClient): AuthManager => {
    const auth: any = {};

    auth.getUserFromToken = async (token: string): Promise<User | undefined> => {
        try {
            const session = await db.session.findFirst({
                where: {
                    token: token,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                select: {
                    user: true
                }
            });
            return session?.user;
        } catch (err) {
            return undefined;
        }
    }

    auth.getToken = (req: Request): String => {
        return req.cookies.access_token;
    }

    auth.setToken = (res: Response, token: string) => {
        res.cookie('access_token', token, { 
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
        });
    }

    auth.deleteSession = async (req: Request) => {
        const token = auth.getToken(req);
        if(token)
            await db.session.deleteMany({
                where: {
                    token: token
                }
            });
    }
    auth.deleteAllSessions = async (userId: number) => {
        await db.session.deleteMany({
            where: {
                userId: userId
            }
        });
    }

    auth.isTokenValid = async (token: string): Promise<Boolean> => {
        var session = await db.session.findFirst({
            where: {
                token: token,
                expiresAt: {
                    gt: new Date()
                }
            },
        });
        return session != null;
    }

    auth.generateNewSession = async (userId: number, ipAddress: string, device: string): Promise<Session> => {
        let token: string;
        do {
            token = jwt.sign({ userId }, process.env.JWT_SECRET);
        } while(await db.session.findFirst({
            where: {
                token: token
            }
        }));
        
        const session = await db.session.create({
            data: {
                userId,
                ipAddress,
                device,
                token: token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days,
            },
        });
        return session;
    }

    auth.ensureAuthorization = (group: number) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const token = auth.getToken(req);

            if(token == null) return res.status(401).json({ error: "Unauthenticated" });
    
            return jwt.verify(token, process.env.JWT_SECRET, async (err: any, data: any) => {
                if(err) return res.status(401).json({ error: "Invalid access token" });
    
                if(!await auth.isTokenValid(token)) return res.status(401).json({ error: "Session has expired" });
    
                const user: User = await auth.getUserFromToken(token);
                if(!user) return res.status(401).json({ error: "Unauthenticated" });

                req.user = user;
                if(user.group > group) return res.status(403).json({ error: "Unauthorized" });
    
                return next();
            });
        }
    }
    auth.ensureAuthentication = async (req: Request, res: Response, next: NextFunction) => {
        const token = auth.getToken(req);

        if(token == null) return res.status(401).json({ error: "Unauthenticated" });

        return jwt.verify(token, process.env.JWT_SECRET, async (err: any, data: any) => {
            if(err) return res.status(401).json({ error: "Invalid access token" });

            if(!await auth.isTokenValid(token)) return res.status(401).json({ error: "Session has expired" });

            const user: User = await auth.getUserFromToken(token);
            if(user == null) return res.status(401).json({ error: "No user found corresponding to access token" });

            req.user = user;
            if(user.lastLogin.getDate() != new Date().getDate()) {
                await db.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        lastLogin: new Date()
                    }
                });
            }

            return next();
        });
    }

    auth.forwardAuthentication = async (req: Request, res: Response, next: NextFunction) => {
        const token = auth.getToken(req);

        if(token == null) return next();

        return jwt.verify(token, process.env.JWT_SECRET, async (err: any, data: any) => {
            if(err) return next();
            if(!await auth.isTokenValid(token)) return next();
            return res.redirect(process.env.NODE_ENV === 'production' ? "https://"+process.env.FRONTEND_DOMAIN : "http://127.0.0.1:3000");
        });
    }

    auth.includeUser = async (req: Request, res: Response, next: NextFunction) => {
        const token = auth.getToken(req);

        if(token == null) return next();

        return jwt.verify(token, process.env.JWT_SECRET, async (err: any, data: any) => {
            if(err) return next();

            if(!await auth.isTokenValid(token)) return next();

            const user: User = await auth.getUserFromToken(token);
            if(user == null) return next();

            req.user = user;
            if(user.lastLogin.getDate() != new Date().getDate()) {
                await db.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        lastLogin: new Date()
                    }
                });
            }

            return next();
        });
    }


    return auth;
}