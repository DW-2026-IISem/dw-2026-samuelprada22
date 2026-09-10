import { Inject, Injectable } from '@nestjs/common';
import { Account } from '../../domain/entities/account.entity.js';
import {
  type IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../domain/interfaces/account-repository.interface.js';
import { CreateAccountDto } from '../dto/create-account.dto.js';
import { AccountMapper } from '../mappers/account.mapper.js';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(dto: CreateAccountDto) {
    const account = Account.create({
      name: dto.name,
      description: dto.description,
    });

    const created = await this.accountRepository.create(account);

    return AccountMapper.toResponse(created);
  }
}
