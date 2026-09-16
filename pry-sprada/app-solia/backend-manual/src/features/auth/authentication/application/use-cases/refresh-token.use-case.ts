import { Injectable, Inject } from '@nestjs/common';

import { Status } from '../../../../../common/enums/status.enum.js';

import { USER_REPOSITORY } from '../../../users/domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface.js';

import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface.js';

import { ROLE_USER_REPOSITORY } from '../../../role-users/domain/interfaces/role-user-repository.interface.js';
import type { IRoleUserRepository } from '../../../role-users/domain/interfaces/role-user-repository.interface.js';

import { CreateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/create-refresh-token.use-case.js';
import { InvalidateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/invalidate-refresh-token.use-case.js';
import { ValidateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/validate-refresh-token.use-case.js';

import { AuthenticationResponseDto } from '../dto/authentication-response.dto.js';
import { RefreshTokenDto } from '../dto/refresh-token.dto.js';

import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception.js';

import { JwtTokenService } from '../../infrastructure/jwt/jwt-token.service.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_USER_REPOSITORY)
    private readonly roleUserRepository: IRoleUserRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    private readonly jwtTokenService: JwtTokenService,

    private readonly validateRefreshTokenUseCase: ValidateRefreshTokenUseCase,

    private readonly invalidateRefreshTokenUseCase: InvalidateRefreshTokenUseCase,

    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthenticationResponseDto> {
    let payload;

    try {
      payload = await this.jwtTokenService.verifyRefreshToken(
        dto.refreshToken,
      );
    } catch {
      throw new InvalidRefreshTokenException();
    }

    const stored = await this.validateRefreshTokenUseCase.execute(
      dto.refreshToken,
    );

    if (!stored) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user || user.isActive !== Status.ACTIVE) {
      throw new InvalidRefreshTokenException();
    }

    const roleUsers = await this.roleUserRepository.findActiveByUserId(
      user.id!,
    );

    const roleIds = roleUsers.map((ru) => ru.roleId);

    const roles = await this.roleRepository.findByIds(roleIds);

    const roleNames = roles.map((role) => role.name);

    const tokens = await this.jwtTokenService.issueTokens({
      sub: user.id!,
      email: user.email,
      username: user.username,
      roles: roleNames,
    });

    await this.invalidateRefreshTokenUseCase.execute(stored.id!);

    await this.createRefreshTokenUseCase.execute({
      userId: user.id!,
      token: tokens.refreshToken,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user.id!,
        email: user.email,
        username: user.username,
        roles: roleNames,
      },
    };
  }
}
