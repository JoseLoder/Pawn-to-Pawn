import { RoleUser } from "./users.types";

export interface RefreshToken {
    id: string;
    id_user: string;
    token: string;
    expires_at: string;
    revoked: boolean;
    created_at: string;
    device_info?: string;
}

export type CreateRefreshToken = Omit<RefreshToken, 'created_at'>

export type AccessTokenEncryption = {
    id_user: string
    role: RoleUser,
}

export type RefreshTokenEncryption = {
    id_token: string,
    id_user: string,
}