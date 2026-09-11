import { Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module.js';
import { CREDIT_APPLICATION_REPOSITORY } from './domain/interfaces/credit-application-repository.interface.js';
import { CreditApplicationRepository } from './infrastructure/persistence/repositories/credit-application.repository.js';
import { CreateCreditApplicationUseCase } from './application/use-cases/create-credit-application.use-case.js';
import { CancelCreditApplicationUseCase } from './application/use-cases/cancel-credit-application.use-case.js';
import { GetCreditApplicationUseCase } from './application/use-cases/get-credit-application.use-case.js';
import { ListCreditApplicationsUseCase } from './application/use-cases/list-credit-applications.use-case.js';
import { CreditApplicationsController } from './presentation/http/controllers/credit-applications.controller.js';

@Module({
  imports: [MembersModule],
  controllers: [CreditApplicationsController],
  providers: [
    CreditApplicationRepository,
    {
      provide: CREDIT_APPLICATION_REPOSITORY,
      useExisting: CreditApplicationRepository,
    },
    CreateCreditApplicationUseCase,
    CancelCreditApplicationUseCase,
    GetCreditApplicationUseCase,
    ListCreditApplicationsUseCase,
  ],
  exports: [CREDIT_APPLICATION_REPOSITORY],
})
export class CreditApplicationsModule {}
