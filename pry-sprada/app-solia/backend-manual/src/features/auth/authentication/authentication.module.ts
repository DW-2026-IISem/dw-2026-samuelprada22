import { Module } from '@nestjs/common';

import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module.js';
import { RoleUsersModule } from '../role-users/role-users.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { UsersModule } from '../users/users.module.js';

import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case.js';

import { JwtStrategy } from './infrastructure/jwt/jwt.strategy.js';
import { JwtTokenService } from './infrastructure/jwt/jwt-token.service.js';

import { BcryptAuthPasswordService } from './infrastructure/password/bcrypt-auth-password.service.js';

import { AuthenticationController } from './presentation/http/controllers/authentication.controller.js';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    RoleUsersModule,
    RefreshTokensModule,
  ],

  controllers: [AuthenticationController],

  providers: [
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    JwtTokenService,
    BcryptAuthPasswordService,
  ],

  exports: [
    JwtStrategy,
    JwtTokenService,
  ],
})
export class AuthenticationModule {}
