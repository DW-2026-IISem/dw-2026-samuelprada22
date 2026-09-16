import { Module } from '@nestjs/common';

import { CreateRefreshTokenUseCase } from './application/use-cases/create-refresh-token.use-case.js';
import { InvalidateRefreshTokenUseCase } from './application/use-cases/invalidate-refresh-token.use-case.js';
import { ValidateRefreshTokenUseCase } from './application/use-cases/validate-refresh-token.use-case.js';

import { refreshTokenRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-refresh-token.repository.js';

@Module({
  providers: [
    refreshTokenRepositoryProvider,
    CreateRefreshTokenUseCase,
    InvalidateRefreshTokenUseCase,
    ValidateRefreshTokenUseCase,
  ],
  exports: [
    refreshTokenRepositoryProvider,
    CreateRefreshTokenUseCase,
    InvalidateRefreshTokenUseCase,
    ValidateRefreshTokenUseCase,
  ],
})
export class RefreshTokensModule {}
