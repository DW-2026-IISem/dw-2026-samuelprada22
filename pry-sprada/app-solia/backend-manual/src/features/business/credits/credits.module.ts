import { Module } from '@nestjs/common';
import { CreditApplicationsModule } from '../credit-applications/credit-applications.module.js';
import { CREDIT_REPOSITORY } from './domain/interfaces/credit-repository.interface.js';
import { CreditRepository } from './infrastructure/persistence/repositories/credit.repository.js';
import { CreateCreditUseCase } from './application/use-cases/create-credit.use-case.js';
import { UpdateCreditUseCase } from './application/use-cases/update-credit.use-case.js';
import { DeleteCreditUseCase } from './application/use-cases/delete-credit.use-case.js';
import { GetCreditUseCase } from './application/use-cases/get-credit.use-case.js';
import { ListCreditsUseCase } from './application/use-cases/list-credits.use-case.js';
import { CreditsController } from './presentation/http/controllers/credits.controller.js';

@Module({
  imports: [CreditApplicationsModule],
  controllers: [CreditsController],
  providers: [
    CreditRepository,
    {
      provide: CREDIT_REPOSITORY,
      useExisting: CreditRepository,
    },
    CreateCreditUseCase,
    UpdateCreditUseCase,
    DeleteCreditUseCase,
    GetCreditUseCase,
    ListCreditsUseCase,
  ],
  exports: [CREDIT_REPOSITORY],
})
export class CreditsModule {}
