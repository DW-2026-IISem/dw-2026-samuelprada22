import { Inject, Injectable } from '@nestjs/common';

import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';

import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/refresh-token-repository.interface.js';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface.js';

@Injectable()
export class ValidateRefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findValidByToken(token);
  }
}
