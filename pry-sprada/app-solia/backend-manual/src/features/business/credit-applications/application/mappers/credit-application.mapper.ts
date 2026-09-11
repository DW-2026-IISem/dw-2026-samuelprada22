import { Status } from '../../../../../common/enums/status.enum.js';
import { CreditApplication } from '../../domain/entities/credit-application.entity.js';
import { CreditApplicationResponseDto } from '../dto/credit-application-response.dto.js';
import { CreditApplicationModel } from '../../infrastructure/persistence/models/credit-application.model.js';

export class CreditApplicationMapper {
  static toDomain(
    model: CreditApplicationModel,
  ): CreditApplication {
    return CreditApplication.reconstitute({
      id: model.id,
      referenceId: model.referenceId,
      date: model.date,
      amount: Number(model.amount),
      status: model.status,
      observations: model.observations ?? undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(
    entity: CreditApplication,
  ): CreditApplicationResponseDto {
    return {
      id: entity.id!,
      referenceId: entity.referenceId,
      date: entity.date,
      amount: entity.amount,
      status: entity.status,
      observations: entity.observations,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  static toPersistence(
    entity: CreditApplication,
  ): Partial<CreditApplicationModel> {
    return {
      id: entity.id,
      referenceId: entity.referenceId,
      date: entity.date,
      amount: entity.amount,
      status: entity.status ?? Status.ACTIVE,
      observations: entity.observations ?? null,
    };
  }
}
