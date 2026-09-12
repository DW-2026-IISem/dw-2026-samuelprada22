import { Module } from '@nestjs/common';
import { INSTALLMENT_REPOSITORY } from './domain/interfaces/installment-repository.interface.js';
import { InstallmentRepository } from './infrastructure/persistence/repositories/installment.repository.js';
import { CreateInstallmentUseCase } from './application/use-cases/create-installment.use-case.js';
import { UpdateInstallmentUseCase } from './application/use-cases/update-installment.use-case.js';
import { DeleteInstallmentUseCase } from './application/use-cases/delete-installment.use-case.js';
import { GetInstallmentUseCase } from './application/use-cases/get-installment.use-case.js';
import { ListInstallmentsUseCase } from './application/use-cases/list-installments.use-case.js';
import { InstallmentsController } from './presentation/http/controllers/installments.controller.js';

@Module({
  controllers: [InstallmentsController],
  providers: [
    InstallmentRepository,
    {
      provide: INSTALLMENT_REPOSITORY,
      useExisting: InstallmentRepository,
    },
    CreateInstallmentUseCase,
    UpdateInstallmentUseCase,
    DeleteInstallmentUseCase,
    GetInstallmentUseCase,
    ListInstallmentsUseCase,
  ],
  exports: [INSTALLMENT_REPOSITORY],
})
export class InstallmentsModule {}
