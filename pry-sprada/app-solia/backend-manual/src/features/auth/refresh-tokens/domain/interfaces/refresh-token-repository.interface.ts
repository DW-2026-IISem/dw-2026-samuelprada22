import { RefreshToken } from '../entities/refresh-token.entity.js';

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

export interface IRefreshTokenRepository {
  create(refreshToken: RefreshToken): Promise<RefreshToken>;
  findValidByToken(token: string): Promise<RefreshToken | null>;
  invalidate(id: number): Promise<void>;
  invalidateAllForUser(userId: number): Promise<void>;
}
