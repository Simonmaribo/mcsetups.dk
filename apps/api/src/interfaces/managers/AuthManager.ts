import { Session, User } from "database";
import { NextFunction, Request, Response } from "express";


export default interface AuthManager {
    getUserFromToken(token: string): Promise<User | undefined>;
    getToken(req: Request): string;
    setToken(res: Response, token: string): void;
    deleteSession(req: Request): void;
    deleteAllSessions(userId: string): void;
    isTokenValid(token: string): Promise<Boolean>;
    generateNewSession(userId: number, ipAddress: string, device: string): Promise<Session>;
    ensureAuthentication(req: Request, res: Response, next: NextFunction): Promise<any>;
    forwardAuthentication(req: Request, res: Response, next: NextFunction): Promise<any>;
    ensureAuthorization(group: number): Promise<any>;
    includeUser(req: Request, res: Response, next: NextFunction): Promise<any>;
}