import { Credit } from '../../../domain/entities/credit.entity.js';
import { CreditResponseDto } from '../../../application/dto/credit-response.dto.js';
import { CreditMapper } from '../../../application/mappers/credit.mapper.js';

export class CreditSerializer {
  static serialize(entity: Credit): CreditResponseDto {
    return CreditMapper.toResponse(entity);
  }
}
