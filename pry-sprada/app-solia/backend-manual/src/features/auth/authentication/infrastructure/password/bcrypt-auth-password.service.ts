import { Injectable, Inject } from '@nestjs/common';

import { PASSWORD_HASHER } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import type { IPasswordHasher } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';

@Injectable()
export class BcryptAuthPasswordService {
  constructor(
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  hash(plain: string): Promise<string> {
    return this.passwordHasher.hash(plain);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return this.passwordHasher.compare(plain, hashed);
  }
}
