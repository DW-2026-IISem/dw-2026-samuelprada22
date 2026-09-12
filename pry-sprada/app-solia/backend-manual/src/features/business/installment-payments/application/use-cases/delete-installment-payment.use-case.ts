import { Inject, Injectable } from '@nestjs/common';
import { InstallmentPaymentNotFoundException } from '../../domain/exceptions/installment-payment-not-found.exception.js';
import {
  type IInstallmentPaymentRepository,
  INSTALLMENT_PAYMENT_REPOSITORY,
} from '../../domain/interfaces/installment-payment-repository.interface.js';

@Injectable()
export class DeleteInstallmentPaymentUseCase {
  constructor(
    @Inject(INSTALLMENT_PAYMENT_REPOSITORY)
    private readonly installmentPaymentRepository: IInstallmentPaymentRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const installmentPayment =
      await this.installmentPaymentRepository.findById(id);

    if (!installmentPayment) {
      throw new InstallmentPaymentNotFoundException(id);
    }

    await this.installmentPaymentRepository.delete(id);
  }
}
