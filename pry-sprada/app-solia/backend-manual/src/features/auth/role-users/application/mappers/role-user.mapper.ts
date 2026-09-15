import { RoleUser } from '../../domain/entities/role-user.entity';
import { RoleUserModel } from '../../infrastructure/persistence/models/role-user.model';

export class RoleUserMapper {
  static toDomain(model: RoleUserModel): RoleUser {
    return new RoleUser({
      id: model.id,
      roleId: model.roleId,
      userId: model.userId,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: RoleUser): Partial<RoleUserModel> {
    return {
      id: entity.id,
      roleId: entity.roleId,
      userId: entity.userId,
      isActive: entity.isActive,
    };
  }

  static toResponse(entity: RoleUser) {
    return {
      id: entity.id,
      roleId: entity.roleId,
      userId: entity.userId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
