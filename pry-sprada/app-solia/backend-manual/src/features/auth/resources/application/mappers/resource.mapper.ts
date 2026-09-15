import { Resource } from '../../domain/entities/resource.entity.js';
import { ResourceModel } from '../../infrastructure/persistence/models/resource.model.js';

export class ResourceMapper {
  static toDomain(model: ResourceModel): Resource {
    return Resource.reconstitute({
      id: model.id,
      path: model.path,
      method: model.method,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: Resource): Partial<ResourceModel> {
    return {
      id: entity.id,
      path: entity.path,
      method: entity.method,
      isActive: entity.isActive,
      status: entity.status,
    };
  }

  static toResponse(entity: Resource) {
    return {
      id: entity.id,
      path: entity.path,
      method: entity.method,
      isActive: entity.isActive,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
