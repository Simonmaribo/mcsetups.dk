import { User } from "database";
import { Request, Response } from "express";

export function parseId(req: Request, res: Response, idParam: string, user?: User): number {
    let id = req.params[idParam] as string | number;
    if(!id) {
        res.status(400).send({ message: "Bad request" });
        return -1;
    }

    if(user && id === "@me") id = user.id;

    try {
        id = parseInt(`${id}`);
    } catch {
        res.status(400).send({ message: "Bad request" });
        return -1;
    }
    if(!id) {
        res.status(400).send({ message: "Bad request" });
        return -1;
    }

    return id;
}