import { Module } from '@nestjs/common';
import { ACCOUNT_REPOSITORY } from './domain/interfaces/account-repository.interface.js';
import { AccountRepository } from './infrastructure/persistence/repositories/account.repository.js';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case.js';
import { UpdateAccountUseCase } from './application/use-cases/update-account.use-case.js';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case.js';
import { GetAccountUseCase } from './application/use-cases/get-account.use-case.js';
import { ListAccountsUseCase } from './application/use-cases/list-accounts.use-case.js';
import { AccountsController } from './presentation/http/controllers/accounts.controller.js';

@Module({
  controllers: [AccountsController],
  providers: [
    AccountRepository,
    { provide: ACCOUNT_REPOSITORY, useExisting: AccountRepository },
    CreateAccountUseCase,
    UpdateAccountUseCase,
    DeleteAccountUseCase,
    GetAccountUseCase,
    ListAccountsUseCase,
  ],
  exports: [ACCOUNT_REPOSITORY],
})
export class AccountsModule {}
