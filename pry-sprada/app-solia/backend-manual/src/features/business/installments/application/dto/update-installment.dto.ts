import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentDto } from './create-installment.dto.js';

export class UpdateInstallmentDto extends PartialType(
  CreateInstallmentDto,
) {}
