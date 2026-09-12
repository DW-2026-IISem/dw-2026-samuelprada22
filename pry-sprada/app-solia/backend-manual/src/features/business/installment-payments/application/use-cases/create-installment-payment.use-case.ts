import { Inject, Injectable } from '@nestjs/common';
import { InstallmentPayment } from '../../domain/entities/installment-payment.entity.js';
import {
  type IInstallmentPaymentRepository,
  INSTALLMENT_PAYMENT_REPOSITORY,
} from '../../domain/interfaces/installment-payment-repository.interface.js';
import { CreateInstallmentPaymentDto } from '../dto/create-installment-payment.dto.js';
import { InstallmentPaymentMapper } from '../mappers/installment-payment.mapper.js';

@Injectable()
export class CreateInstallmentPaymentUseCase {
  constructor(
    @Inject(INSTALLMENT_PAYMENT_REPOSITORY)
    private readonly installmentPaymentRepository: IInstallmentPaymentRepository,
  ) {}

  async execute(dto: CreateInstallmentPaymentDto) {
    const installmentPayment = InstallmentPayment.create(dto);

    const created =
      await this.installmentPaymentRepository.create(
        installmentPayment,
      );

    return InstallmentPaymentMapper.toResponse(created);
  }
}
