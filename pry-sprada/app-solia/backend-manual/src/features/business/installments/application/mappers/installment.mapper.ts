import { Status } from '../../../../../common/enums/status.enum.js';
import { Installment } from '../../domain/entities/installment.entity.js';
import { InstallmentResponseDto } from '../dto/installment-response.dto.js';
import { InstallmentModel } from '../../infrastructure/persistence/models/installment.model.js';

export class InstallmentMapper {
  static toDomain(model: InstallmentModel): Installment {
    return Installment.reconstitute({
      id: model.id,
      creditId: model.creditId,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(
    entity: Installment,
  ): InstallmentResponseDto {
    return {
      id: entity.id!,
      creditId: entity.creditId,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(
    entity: Installment,
  ): Partial<InstallmentModel> {
    return {
      id: entity.id,
      creditId: entity.creditId,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
