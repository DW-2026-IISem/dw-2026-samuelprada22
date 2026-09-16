import { Inject, Injectable } from '@nestjs/common';

import { TOKEN_SERVICE } from '../../../../../infrastructure/security/tokens/token.interface.js';
import type {
  ITokenService,
  IssuedTokens,
  TokenPayload,
} from '../../../../../infrastructure/security/tokens/token.interface.js';

@Injectable()
export class JwtTokenService {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  issueTokens(payload: TokenPayload): Promise<IssuedTokens> {
    return this.tokenService.issueTokens(payload);
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.tokenService.verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.tokenService.verifyRefreshToken(token);
  }
}
