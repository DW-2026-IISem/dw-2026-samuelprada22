import { RoleUser } from '../../domain/entities/role-user.entity.js';
import { RoleUserModel } from '../../infrastructure/persistence/models/role-user.model.js';

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

  static toPersistence(
    roleUser: Partial<RoleUser>,
  ): Partial<RoleUserModel> {
    return {
      id: roleUser.id,
      roleId: roleUser.roleId,
      userId: roleUser.userId,
      isActive: roleUser.isActive,
      createdAt: roleUser.createdAt,
      updatedAt: roleUser.updatedAt,
    };
  }

  static toResponse(roleUser: RoleUser) {
    return {
      id: roleUser.id,
      roleId: roleUser.roleId,
      userId: roleUser.userId,
      isActive: roleUser.isActive,
      createdAt: roleUser.createdAt,
      updatedAt: roleUser.updatedAt,
    };
  }
}
