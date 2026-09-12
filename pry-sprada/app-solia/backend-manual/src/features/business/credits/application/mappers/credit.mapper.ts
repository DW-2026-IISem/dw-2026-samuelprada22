import { Status } from '../../../../../common/enums/status.enum.js';
import { Credit } from '../../domain/entities/credit.entity.js';
import { CreditResponseDto } from '../dto/credit-response.dto.js';
import { CreditModel } from '../../infrastructure/persistence/models/credit.model.js';

export class CreditMapper {
  static toDomain(model: CreditModel): Credit {
    return Credit.reconstitute({
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

  static toResponse(entity: Credit): CreditResponseDto {
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
    entity: Credit,
  ): Partial<CreditModel> {
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
