import { Request, Response, NextFunction } from "express";
import { handleError } from "../errors/handleError";
import { UnauthorizedError } from "../errors/client.error";

export function authClient(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.session?.userSession || req.session.userSession.role !== 'client') {
            throw new UnauthorizedError('Unauthorized access as a client')
        }
        next()
    } catch (e) {
        handleError(e as Error, res)
    }
}