import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentPaymentDto } from './create-installment-payment.dto.js';

export class UpdateInstallmentPaymentDto extends PartialType(
  CreateInstallmentPaymentDto,
) {}
