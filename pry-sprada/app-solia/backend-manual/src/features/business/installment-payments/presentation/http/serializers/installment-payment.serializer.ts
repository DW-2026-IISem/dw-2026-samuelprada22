import { InstallmentPayment } from '../../../domain/entities/installment-payment.entity.js';
import { InstallmentPaymentResponseDto } from '../../../application/dto/installment-payment-response.dto.js';
import { InstallmentPaymentMapper } from '../../../application/mappers/installment-payment.mapper.js';

export class InstallmentPaymentSerializer {
  static serialize(
    entity: InstallmentPayment,
  ): InstallmentPaymentResponseDto {
    return InstallmentPaymentMapper.toResponse(entity);
  }
}
