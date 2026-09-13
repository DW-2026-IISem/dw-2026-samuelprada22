import { Module } from '@nestjs/common';
import { INSTALLMENT_PAYMENT_REPOSITORY } from './domain/interfaces/installment-payment-repository.interface.js';
import { InstallmentPaymentRepository } from './infrastructure/persistence/repositories/installment-payment.repository.js';
import { CreateInstallmentPaymentUseCase } from './application/use-cases/create-installment-payment.use-case.js';
import { UpdateInstallmentPaymentUseCase } from './application/use-cases/update-installment-payment.use-case.js';
import { DeleteInstallmentPaymentUseCase } from './application/use-cases/delete-installment-payment.use-case.js';
import { GetInstallmentPaymentUseCase } from './application/use-cases/get-installment-payment.use-case.js';
import { ListInstallmentPaymentsUseCase } from './application/use-cases/list-installment-payments.use-case.js';
import { InstallmentPaymentsController } from './presentation/http/controllers/installment-payments.controller.js';

@Module({
  controllers: [InstallmentPaymentsController],
  providers: [
    InstallmentPaymentRepository,
    {
      provide: INSTALLMENT_PAYMENT_REPOSITORY,
      useExisting: InstallmentPaymentRepository,
    },
    CreateInstallmentPaymentUseCase,
    UpdateInstallmentPaymentUseCase,
    DeleteInstallmentPaymentUseCase,
    GetInstallmentPaymentUseCase,
    ListInstallmentPaymentsUseCase,
  ],
  exports: [INSTALLMENT_PAYMENT_REPOSITORY],
})
export class InstallmentPaymentsModule {}
