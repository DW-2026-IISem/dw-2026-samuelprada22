import { Role } from '../../domain/entities/role.entity.js';
import { RoleModel } from '../../infrastructure/persistence/models/role.model.js';

export class RoleMapper {
  static toDomain(model: RoleModel): Role {
    return Role.reconstitute({
      id: model.id,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: Role): Partial<RoleModel> {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      isActive: entity.isActive,
      status: entity.status,
    };
  }

  static toResponse(entity: Role) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
