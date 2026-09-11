import { Movement } from '../../../domain/entities/movement.entity.js';
import { MovementResponseDto } from '../../../application/dto/movement-response.dto.js';
import { MovementMapper } from '../../../application/mappers/movement.mapper.js';

export class MovementSerializer {
  static serialize(entity: Movement): MovementResponseDto {
    return MovementMapper.toResponse(entity);
  }
}
