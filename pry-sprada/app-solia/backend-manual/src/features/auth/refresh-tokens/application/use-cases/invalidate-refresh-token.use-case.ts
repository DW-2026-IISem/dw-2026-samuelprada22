import { Inject, Injectable } from '@nestjs/common';

import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/refresh-token-repository.interface.js';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface.js';

@Injectable()
export class InvalidateRefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.refreshTokenRepository.invalidate(id);
  }

  async executeAllForUser(userId: number): Promise<void> {
    await this.refreshTokenRepository.invalidateAllForUser(userId);
  }
}
