import { Injectable, Inject } from '@nestjs/common';

import { Status } from '../../../../../common/enums/status.enum.js';

import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface.js';

import { ROLE_USER_REPOSITORY } from '../../../role-users/domain/interfaces/role-user-repository.interface.js';
import type { IRoleUserRepository } from '../../../role-users/domain/interfaces/role-user-repository.interface.js';

import { USER_REPOSITORY } from '../../../users/domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface.js';

import { CreateRefreshTokenUseCase } from '../../../refresh-tokens/application/use-cases/create-refresh-token.use-case.js';

import { AuthenticationResponseDto } from '../dto/authentication-response.dto.js';
import { LoginDto } from '../dto/login.dto.js';

import { InactiveUserException } from '../../domain/exceptions/inactive-user.exception.js';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception.js';

import { BcryptAuthPasswordService } from '../../infrastructure/password/bcrypt-auth-password.service.js';
import { JwtTokenService } from '../../infrastructure/jwt/jwt-token.service.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(ROLE_USER_REPOSITORY)
    private readonly roleUserRepository: IRoleUserRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    private readonly authPasswordService: BcryptAuthPasswordService,

    private readonly jwtTokenService: JwtTokenService,

    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
  ) {}

  async execute(dto: LoginDto): Promise<AuthenticationResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (user.isActive !== Status.ACTIVE) {
      throw new InactiveUserException();
    }

    const passwordValid = await this.authPasswordService.compare(
      dto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new InvalidCredentialsException();
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
