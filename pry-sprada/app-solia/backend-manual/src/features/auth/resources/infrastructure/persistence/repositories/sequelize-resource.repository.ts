import { Injectable } from '@nestjs/common';

import { Resource } from '../../../domain/entities/resource.entity.js';

import {
  RESOURCE_REPOSITORY,
  type IResourceRepository,
} from '../../../domain/interfaces/resource-repository.interface.js';

import { ResourceModel } from '../models/resource.model.js';

import { ResourceMapper } from '../../../application/mappers/resource.mapper.js';

@Injectable()
export class SequelizeResourceRepository implements IResourceRepository {
  async create(resource: Resource): Promise<Resource> {
    const model = await ResourceModel.create(
      ResourceMapper.toPersistence(resource),
    );

    return ResourceMapper.toDomain(model);
  }

  async findAll(): Promise<Resource[]> {
    const models = await ResourceModel.findAll({
      order: [['id', 'ASC']],
    });

    return models.map(ResourceMapper.toDomain);
  }

  async findById(id: number): Promise<Resource | null> {
    const model = await ResourceModel.findByPk(id);

    return model ? ResourceMapper.toDomain(model) : null;
  }

  async findByPathAndMethod(
    path: string,
    method: string,
  ): Promise<Resource | null> {
    const model = await ResourceModel.findOne({
      where: {
        path,
        method,
      },
    });

    return model ? ResourceMapper.toDomain(model) : null;
  }

  async update(
    id: number,
    data: Partial<Resource>,
  ): Promise<Resource> {
    const model = await ResourceModel.findByPk(id);

    if (!model) {
      throw new Error(`Recurso ${id} no encontrado`);
    }

    const currentResource = ResourceMapper.toDomain(model);

    const updatedResource = Resource.reconstitute({
      id: currentResource.id,
      path: data.path ?? currentResource.path,
      method: data.method ?? currentResource.method,
      isActive: data.isActive ?? currentResource.isActive,
      status: data.status ?? currentResource.status,
      createdAt: currentResource.createdAt,
      updatedAt: currentResource.updatedAt,
    });

    await model.update(
      ResourceMapper.toPersistence(updatedResource),
    );

    return ResourceMapper.toDomain(model);
  }

  async delete(id: number): Promise<void> {
    await ResourceModel.destroy({
      where: { id },
    });
  }
}

export const resourceRepositoryProvider = {
  provide: RESOURCE_REPOSITORY,
  useClass: SequelizeResourceRepository,
};
