import { Inject, Injectable } from '@nestjs/common';
import { AccountNotFoundException } from '../../domain/exceptions/account-not-found.exception.js';
import {
  ACCOUNT_REPOSITORY,
  type IAccountRepository,
} from '../../domain/interfaces/account-repository.interface.js';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const account = await this.accountRepository.findById(id);

    if (!account) {
      throw new AccountNotFoundException(id);
    }

    await this.accountRepository.delete(id);
  }
}
