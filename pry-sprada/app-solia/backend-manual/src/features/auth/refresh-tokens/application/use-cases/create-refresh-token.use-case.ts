import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Status } from '../../../../../common/enums/status.enum.js';
import { parseDurationToMs } from '../../../../../common/utils/date.util.js';

import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';

import { REFRESH_TOKEN_REPOSITORY } from '../../domain/interfaces/refresh-token-repository.interface.js';
import type { IRefreshTokenRepository } from '../../domain/interfaces/refresh-token-repository.interface.js';

export interface CreateRefreshTokenInput {
  userId: number;
  token: string;
  deviceInfo?: string;
}

@Injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const refreshExpiresIn =
      this.configService.get<string>('environment.jwt.refreshExpiresIn') ||
      '7d';

    const expiresAt = new Date(
      Date.now() + parseDurationToMs(refreshExpiresIn),
    );

    return this.refreshTokenRepository.create(
      new RefreshToken({
        userId: input.userId,
        token: input.token,
        deviceInfo: input.deviceInfo,
        isValid: Status.ACTIVE,
        expiresAt,
      }),
    );
  }
}
