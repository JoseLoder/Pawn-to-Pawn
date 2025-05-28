import { DB } from '../database/connect';
import { QueryError } from '../errors/server.error';
import { CreateRefreshToken, RefreshToken } from '@pawn-to-pawn/shared';

export const RefreshTokenModel = {
    // Crear un nuevo refresh token
    async create(token: CreateRefreshToken): Promise<string> {
        const sql = `
      INSERT INTO user_refresh_tokens (id, id_user, token, expires_at, revoked, device_info)
      VALUES (?, ?, ?, ?, ?, ?)`;

        return new Promise((resolve, reject) => {
            DB.run(
                sql,
                [token.id, token.id_user, token.token, token.expires_at, token.revoked ? 1 : 0, token.device_info],
                (err) => {
                    if (err) {
                        return reject(new QueryError(`Could not create refresh token: ${err.message}`));
                    }
                    resolve(token.token);
                }
            );
        });
    },

    // Buscar por token (para validación)
    async getByToken(token: string): Promise<RefreshToken> {
        const sql = `
      SELECT * FROM user_refresh_tokens
      WHERE token = ? AND revoked = 0 AND expires_at > datetime('now')`;

        return new Promise((resolve, reject) => {
            DB.get(sql, [token], (err, row) => {
                if (err) return reject(new QueryError('Could not fetch refresh token'));
                resolve(row as RefreshToken);
            });
        });
    },

    // Revocar un token (logout)
    async revoke(token: string): Promise<boolean> {
        const sql = `
      UPDATE user_refresh_tokens
      SET revoked = 1
      WHERE token = ?`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [token], function (err) {
                if (err) return reject(new QueryError('Could not revoke token'));
                resolve(this.changes > 0); // Devuelve true si se actualizó alguna fila
            });
        });
    },

    // Revocar todos los tokens de un usuario (logout all devices)
    async revokeAllForUser(user_id: string): Promise<boolean> {
        const sql = `
      UPDATE user_refresh_tokens
      SET revoked = 1
      WHERE user_id = ? AND revoked = 0`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [user_id], function (err) {
                if (err) return reject(new QueryError('Could not revoke tokens'));
                resolve(this.changes > 0);
            });
        });
    },
    // Revocar todos los tokens del mismo dispositivo de un usuario (logout one devices)
    async revokeAllForUserDevice(id_user: string, headers: string): Promise<boolean> {
        const sql = `
          UPDATE user_refresh_tokens
          SET revoked = 1
          WHERE user_id = ? AND revoked = 0 AND device_info = ?`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [id_user, headers], function (err) {
                if (err) return reject(new QueryError('Could not revoke tokens'));
                resolve(true);
            });
        });
    },

    // Limpieza de tokens expirados (para ejecutar periódicamente)
    async cleanupExpiredTokens(id_user: string): Promise<Boolean> {
        const sql = `
      DELETE FROM user_refresh_tokens
      WHERE id_user = ? AND (revoked = 1 OR expires_at < datetime('now'))`;

        return new Promise((resolve, reject) => {
            DB.run(sql, [id_user], function (err) {
                if (err) return reject(new QueryError('Could not clean tokens'));
                resolve(true);
            });
        });
    },

    async showUsersToken(userId: string): Promise<RefreshToken[]> {
        const sql = `
        SELECT * 
        FROM user_refresh_tokens 
        WHERE user_id = ? AND revoked = 1 
        `
        const data: { tokens: RefreshToken[] } = { tokens: [] }

        return new Promise((resolve, reject: (reason: Error) => void) => {
            DB.all(sql, [userId], (err, rows) => {
                if (err) return reject(new QueryError('Could not get all clients'));

                (rows as RefreshToken[]).forEach((row: RefreshToken) => {
                    data.tokens.push({
                        ...row
                    })
                })
                const { tokens } = data
                resolve(tokens)
            })
        })
    }
};