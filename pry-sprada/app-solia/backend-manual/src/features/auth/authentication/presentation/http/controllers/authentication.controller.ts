import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '../../../../../../common/decorators/public.decorator.js';

import { LoginDto } from '../../../application/dto/login.dto.js';
import { LogoutDto } from '../../../application/dto/logout.dto.js';
import { RefreshTokenDto } from '../../../application/dto/refresh-token.dto.js';

import { LoginUseCase } from '../../../application/use-cases/login.use-case.js';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case.js';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case.js';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    await this.logoutUseCase.execute(dto);

    return {
      message: 'Sesión cerrada',
    };
  }
}
