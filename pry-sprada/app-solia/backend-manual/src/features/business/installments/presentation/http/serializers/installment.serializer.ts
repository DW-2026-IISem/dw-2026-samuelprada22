import { Installment } from '../../../domain/entities/installment.entity.js';
import { InstallmentResponseDto } from '../../../application/dto/installment-response.dto.js';
import { InstallmentMapper } from '../../../application/mappers/installment.mapper.js';

export class InstallmentSerializer {
  static serialize(entity: Installment): InstallmentResponseDto {
    return InstallmentMapper.toResponse(entity);
  }
}
