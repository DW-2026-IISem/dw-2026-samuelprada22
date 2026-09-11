import { Status } from '../../../../../common/enums/status.enum.js';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementResponseDto } from '../dto/movement-response.dto.js';
import { MovementModel } from '../../infrastructure/persistence/models/movement.model.js';

export class MovementMapper {
  static toDomain(model: MovementModel): Movement {
    return Movement.reconstitute({
      id: model.id,
      referenceId: model.referenceId,
      type: model.type,
      date: model.date,
      amount: Number(model.amount),
      observations: model.observations ?? undefined,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(entity: Movement): MovementResponseDto {
    return {
      id: entity.id!,
      referenceId: entity.referenceId,
      type: entity.type,
      date: entity.date,
      amount: entity.amount,
      observations: entity.observations,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(entity: Movement): Partial<MovementModel> {
    return {
      id: entity.id,
      referenceId: entity.referenceId,
      type: entity.type,
      date: entity.date,
      amount: entity.amount,
      observations: entity.observations ?? null,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
