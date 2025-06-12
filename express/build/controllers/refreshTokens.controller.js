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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokensController = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const handleError_1 = require("../errors/handleError");
const refreshToken_model_1 = require("../models/refreshToken.model");
const user_model_1 = require("../models/user.model");
const client_error_1 = require("../errors/client.error");
const server_error_1 = require("../errors/server.error");
exports.RefreshTokensController = {
    async refresh(req, res, next) {
        try {
            // 1. Obtener el refresh token de cookies
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                throw new jsonwebtoken_1.JsonWebTokenError('Refresh token is required, please login again');
            }
            // 2. Verificar y decodificar el refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret');
            // 3. Validar en base de datos
            const storedToken = await refreshToken_model_1.RefreshTokenModel.getByToken(refreshToken);
            if (!storedToken) {
                throw new jsonwebtoken_1.JsonWebTokenError('Invalid or expired refresh token, please login again');
            }
            // 4. Traer el rol del usuario
            const user = await user_model_1.UserModel.getById(decoded.id_user);
            if (!user) {
                throw new jsonwebtoken_1.JsonWebTokenError('The user associated with the token does not exist, please login again');
            }
            // 5. Generar nuevo access token
            const newAccessToken = jsonwebtoken_1.default.sign({
                id_user: user.id,
                role: user.role
            }, process.env.SECRET_JWT_KEY ?? 'fallback_secret', { expiresIn: '60m' });
            // 6. Rotación: Crear nuevo refresh token
            const newRefreshToken = await exports.RefreshTokensController.create(user.id, req.headers['user-agent']);
            // 7. Revocar el anterior y limpiar tokens expirados
            await refreshToken_model_1.RefreshTokenModel.revoke(refreshToken);
            await refreshToken_model_1.RefreshTokenModel.deleteExpired();
            // 8. Actualizar la sesión
            req.session = {
                userSession: {
                    id_user: user.id,
                    role: user.role
                }
            };
            // 9. Configurar cookies
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/'
            };
            res
                .cookie('access_token', newAccessToken, {
                ...cookieOptions,
                maxAge: 60 * 60 * 1000 // 60 minutos
            })
                .cookie('refresh_token', newRefreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });
            next();
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    // This function only use in controller User
    async create(id_user, headers) {
        // 5. Rotación: Crear nuevo refresh token
        const newIdRefreshToken = crypto_1.default.randomUUID();
        const newRefreshToken = jsonwebtoken_1.default.sign({
            id_token: newIdRefreshToken,
            id_user
        }, process.env.REFRESH_JWT_KEY ?? 'fallback_refresh_secret', { expiresIn: '7d' });
        // 6. Actualizar en base de datos
        const refreshToken = await refreshToken_model_1.RefreshTokenModel.create({
            id: newIdRefreshToken,
            id_user,
            token: newRefreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            revoked: false,
            device_info: headers
        });
        await refreshToken_model_1.RefreshTokenModel.deleteExpired();
        return refreshToken;
    },
    async revoke(token) {
        await refreshToken_model_1.RefreshTokenModel.revoke(token);
    },
    async revokeAll(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new client_error_1.ClientError('User ID is required');
            const revoked = await refreshToken_model_1.RefreshTokenModel.revokeAllForUser(id);
            if (!revoked) {
                throw new server_error_1.ServerError('Failed to revoke tokens');
            }
            res.status(200).json({
                success: true,
                message: 'All refresh tokens revoked successfully'
            });
        }
        catch (e) {
            (0, handleError_1.handleError)(e, res);
        }
    },
    async revokeAllForUserDevice(user_id, headers) {
        await refreshToken_model_1.RefreshTokenModel.revokeAllForUserDevice(user_id, headers);
    },
    async getByToken(token) {
        return await refreshToken_model_1.RefreshTokenModel.getByToken(token);
    }
};
