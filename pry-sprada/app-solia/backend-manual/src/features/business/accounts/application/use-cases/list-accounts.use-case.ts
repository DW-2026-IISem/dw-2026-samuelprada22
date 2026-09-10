import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  type IAccountRepository,
} from '../../domain/interfaces/account-repository.interface.js';
import { AccountFilterDto } from '../dto/account-filter.dto.js';
import { AccountMapper } from '../mappers/account.mapper.js';

@Injectable()
export class ListAccountsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(filter: AccountFilterDto) {
    const result = await this.accountRepository.findAll(filter);

    return {
      items: result.items.map((account) =>
        AccountMapper.toResponse(account),
      ),
      meta: result.meta,
    };
  }
}
