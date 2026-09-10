import { Status } from '../../../../../common/enums/status.enum.js';
import { Account } from '../../domain/entities/account.entity.js';
import { AccountResponseDto } from '../dto/account-response.dto.js';
import { AccountModel } from '../../infrastructure/persistence/models/account.model.js';

export class AccountMapper {
  static toDomain(model: AccountModel): Account {
    return Account.reconstitute({
      id: model.id,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toResponse(entity: Account): AccountResponseDto {
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

  static toPersistence(entity: Account): Partial<AccountModel> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status ?? Status.ACTIVE,
    };
  }
}
