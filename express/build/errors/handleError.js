"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const zod_1 = require("zod");
const server_error_1 = require("./server.error");
const client_error_1 = require("./client.error");
const jsonwebtoken_1 = require("jsonwebtoken");
const handleError = (e, res) => {
    if (e instanceof zod_1.ZodError) {
        res.status(400).json({
            name: 'ValidationError',
            errors: e.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    else if (e instanceof jsonwebtoken_1.JsonWebTokenError) {
        res
            .status(401)
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .json({
            name: e.name,
            message: e.message
        });
    }
    else if (e instanceof client_error_1.ClientError) {
        res.status(400).json({
            name: e.name,
            message: e.message
        });
    }
    else if (e instanceof server_error_1.ServerError) {
        res.status(500).json({
            name: e.name,
            message: e.message
        });
    }
    else {
        res.status(500).json({
            name: 'UnexpectedError',
            message: 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && {
                error: e instanceof Error ? e.message : 'Unknown error',
                stack: e instanceof Error ? e.stack : undefined
            })
        });
    }
};
exports.handleError = handleError;
