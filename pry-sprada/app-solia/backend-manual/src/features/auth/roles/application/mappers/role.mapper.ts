import { Role } from '../../domain/entities/role.entity';
import { RoleModel } from '../../infrastructure/persistence/models/role.model';

export class RoleMapper {
  static toDomain(model: RoleModel): Role {
    return new Role({
      id: model.id,
      name: model.name,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: Role): Partial<RoleModel> {
    return {
      id: entity.id,
      name: entity.name,
      isActive: entity.isActive,
    };
  }

  static toResponse(entity: Role) {
    return {
      id: entity.id,
      name: entity.name,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
