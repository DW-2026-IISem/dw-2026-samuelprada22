import { Status } from '../../../../../common/enums/status.enum.js';
import { Rate } from '../../domain/entities/rate.entity.js';
import { RateResponseDto } from '../dto/rate-response.dto.js';
import { RateModel } from '../../infrastructure/persistence/models/rate.model.js';

export class RateMapper {
  static toDomain(model: RateModel): Rate {
    return Rate.reconstitute({
      id: model.id,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(entity: Rate): RateResponseDto {
    return {
      id: entity.id!,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(entity: Rate): Partial<RateModel> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
