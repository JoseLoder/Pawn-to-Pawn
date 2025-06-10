"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
exports.authClient = authClient;
exports.authOperator = authOperator;
exports.authAdmin = authAdmin;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const refreshTokens_controller_1 = require("../controllers/refreshTokens.controller");
const client_error_1 = require("../errors/client.error");
const handleError_1 = require("../errors/handleError");
// Extend the Request interface to include the session property
function auth(req, res, next) {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    req.session = { userSession: null };
    try {
        // First try to verify the access token
        const data = jsonwebtoken_1.default.verify(accessToken, process.env.SECRET_JWT_KEY || 'fallback_secret');
        req.session.userSession = data;
        return next();
    }
    catch (e) {
        // If access token is invalid/expired and we have a refresh token, try to refresh
        if (refreshToken) {
            return refreshTokens_controller_1.RefreshTokensController.refresh(req, res, next);
        }
        // If no refresh token, handle the error
        (0, handleError_1.handleError)(new jsonwebtoken_1.JsonWebTokenError('Authentication required, please login again'), res);
        return;
    }
}
// Auth Clients
function authClient(req, res, next) {
    try {
        if (!req.session?.userSession) {
            throw new client_error_1.UnauthorizedError(`Unauthorized access as a client`);
        }
        next();
    }
    catch (e) {
        (0, handleError_1.handleError)(e, res);
    }
}
// Auth Operator
function authOperator(req, res, next) {
    try {
        if (!req.session?.userSession ||
            (req.session.userSession.role !== 'operator' &&
                req.session.userSession.role !== 'admin')) {
            throw new client_error_1.UnauthorizedError(`Unauthorized access as a operator`);
        }
        next();
    }
    catch (e) {
        (0, handleError_1.handleError)(e, res);
    }
}
// Auth Admin
function authAdmin(req, res, next) {
    try {
        if (!req.session?.userSession || req.session.userSession.role !== 'admin') {
            throw new client_error_1.UnauthorizedError(`Unauthorized access as a admin`);
        }
        next();
    }
    catch (e) {
        (0, handleError_1.handleError)(e, res);
    }
}
