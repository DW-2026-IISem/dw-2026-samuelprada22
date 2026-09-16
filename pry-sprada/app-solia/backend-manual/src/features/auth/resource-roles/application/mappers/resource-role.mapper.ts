import { ResourceRole } from '../../domain/entities/resource-role.entity.js';
import { ResourceRoleModel } from '../../infrastructure/persistence/models/resource-role.model.js';

export class ResourceRoleMapper {
  static toDomain(model: ResourceRoleModel): ResourceRole {
    return new ResourceRole({
      id: model.id,
      resourceId: model.resourceId,
      roleId: model.roleId,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(
    entity: Partial<ResourceRole>,
  ): Partial<ResourceRoleModel> {
    return {
      id: entity.id,
      resourceId: entity.resourceId,
      roleId: entity.roleId,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toResponse(entity: ResourceRole) {
    return {
      id: entity.id,
      resourceId: entity.resourceId,
      roleId: entity.roleId,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
