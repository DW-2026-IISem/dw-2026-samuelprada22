import { CreditApplication } from '../../../domain/entities/credit-application.entity.js';
import { CreditApplicationResponseDto } from '../../../application/dto/credit-application-response.dto.js';
import { CreditApplicationMapper } from '../../../application/mappers/credit-application.mapper.js';

export class CreditApplicationSerializer {
  static serialize(
    entity: CreditApplication,
  ): CreditApplicationResponseDto {
    return CreditApplicationMapper.toResponse(entity);
  }
}
