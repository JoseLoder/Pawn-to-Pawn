import { RoleUser } from "./users.types";

export interface RefreshToken {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    revoked: boolean;
    created_at: string;
    device_info?: string;
}

export type CreateRefreshToken = Omit<RefreshToken, 'id' | 'created_at'>

export interface AccessTokenEncryption {
    userId: string
    role?: RoleUser,
}

export interface RefreshTokenEncryption {
    tokenId: string,
    userId: string,
}