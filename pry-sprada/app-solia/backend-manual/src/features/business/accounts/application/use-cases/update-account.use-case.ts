import { Inject, Injectable } from '@nestjs/common';
import { AccountNotFoundException } from '../../domain/exceptions/account-not-found.exception.js';
import {
  type IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../domain/interfaces/account-repository.interface.js';
import { UpdateAccountDto } from '../dto/update-account.dto.js';
import { AccountMapper } from '../mappers/account.mapper.js';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(id: number, dto: UpdateAccountDto) {
    const account = await this.accountRepository.findById(id);

    if (!account) {
      throw new AccountNotFoundException(id);
    }

    account.update({
      name: dto.name,
      description: dto.description,
    });

    const updated = await this.accountRepository.update(account);

    return AccountMapper.toResponse(updated);
  }
}
