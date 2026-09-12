import { Inject, Injectable } from '@nestjs/common';
import {
  type IInstallmentPaymentRepository,
  INSTALLMENT_PAYMENT_REPOSITORY,
} from '../../domain/interfaces/installment-payment-repository.interface.js';
import { InstallmentPaymentFilterDto } from '../dto/installment-payment-filter.dto.js';
import { InstallmentPaymentMapper } from '../mappers/installment-payment.mapper.js';

@Injectable()
export class ListInstallmentPaymentsUseCase {
  constructor(
    @Inject(INSTALLMENT_PAYMENT_REPOSITORY)
    private readonly installmentPaymentRepository: IInstallmentPaymentRepository,
  ) {}

  async execute(filter: InstallmentPaymentFilterDto) {
    const result =
      await this.installmentPaymentRepository.findAll(filter);

    return {
      items: result.items.map((installmentPayment) =>
        InstallmentPaymentMapper.toResponse(installmentPayment),
      ),
      meta: result.meta,
    };
  }
}
