import { Inject, Injectable } from '@nestjs/common';
import { InstallmentPaymentNotFoundException } from '../../domain/exceptions/installment-payment-not-found.exception.js';
import {
  type IInstallmentPaymentRepository,
  INSTALLMENT_PAYMENT_REPOSITORY,
} from '../../domain/interfaces/installment-payment-repository.interface.js';
import { UpdateInstallmentPaymentDto } from '../dto/update-installment-payment.dto.js';
import { InstallmentPaymentMapper } from '../mappers/installment-payment.mapper.js';

@Injectable()
export class UpdateInstallmentPaymentUseCase {
  constructor(
    @Inject(INSTALLMENT_PAYMENT_REPOSITORY)
    private readonly installmentPaymentRepository: IInstallmentPaymentRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateInstallmentPaymentDto,
  ) {
    const installmentPayment =
      await this.installmentPaymentRepository.findById(id);

    if (!installmentPayment) {
      throw new InstallmentPaymentNotFoundException(id);
    }

    installmentPayment.update(dto);

    const updated =
      await this.installmentPaymentRepository.update(
        installmentPayment,
      );

    return InstallmentPaymentMapper.toResponse(updated);
  }
}
