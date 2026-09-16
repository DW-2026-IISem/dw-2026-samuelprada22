import { Injectable } from '@nestjs/common';

import { ValidateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/validate-refresh-token.use-case.js';
import { InvalidateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/invalidate-refresh-token.use-case.js';

import { LogoutDto } from '../dto/logout.dto.js';

import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception.js';

import { JwtTokenService } from '../../infrastructure/jwt/jwt-token.service.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly jwtTokenService: JwtTokenService,

    private readonly validateRefreshTokenUseCase: ValidateRefreshTokenUseCase,

    private readonly invalidateRefreshTokenUseCase: InvalidateRefreshTokenUseCase,
  ) {}

  async execute(dto: LogoutDto): Promise<void> {
    try {
      await this.jwtTokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new InvalidRefreshTokenException();
    }

    const stored = await this.validateRefreshTokenUseCase.execute(
      dto.refreshToken,
    );

    if (!stored) {
      throw new InvalidRefreshTokenException();
    }

    await this.invalidateRefreshTokenUseCase.execute(stored.id!);
  }
}
