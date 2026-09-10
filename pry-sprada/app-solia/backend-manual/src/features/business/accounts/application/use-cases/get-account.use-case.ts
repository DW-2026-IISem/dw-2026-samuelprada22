import { Inject, Injectable } from '@nestjs/common';
import { AccountNotFoundException } from '../../domain/exceptions/account-not-found.exception.js';
import {
  type IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../domain/interfaces/account-repository.interface.js';
import { AccountMapper } from '../mappers/account.mapper.js';

@Injectable()
export class GetAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(id: number) {
    const account = await this.accountRepository.findById(id);

    if (!account) {
      throw new AccountNotFoundException(id);
    }

    return AccountMapper.toResponse(account);
  }
}
