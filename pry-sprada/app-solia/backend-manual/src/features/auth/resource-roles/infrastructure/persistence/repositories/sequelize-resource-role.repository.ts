import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { Status } from '../../../../../../common/enums/status.enum.js';

import { ResourceRole } from '../../../domain/entities/resource-role.entity.js';

import {
  RESOURCE_ROLE_REPOSITORY,
} from '../../../domain/interfaces/resource-role-repository.interface.js';

import type {
  IResourceRoleRepository,
} from '../../../domain/interfaces/resource-role-repository.interface.js';

import { ResourceRoleModel } from '../models/resource-role.model.js';

import { ResourceRoleMapper } from '../../../application/mappers/resource-role.mapper.js';

@Injectable()
export class SequelizeResourceRoleRepository
  implements IResourceRoleRepository
{
  async assign(resourceRole: ResourceRole): Promise<ResourceRole> {
    const model = await ResourceRoleModel.create(
      ResourceRoleMapper.toPersistence(resourceRole),
    );

    return ResourceRoleMapper.toDomain(model);
  }

  async revoke(id: number): Promise<void> {
    await ResourceRoleModel.update(
      {
        isActive: false,
        status: Status.INACTIVE,
      },
      {
        where: { id },
      },
    );
  }

  async findAll(): Promise<ResourceRole[]> {
    const models = await ResourceRoleModel.findAll({
      order: [['id', 'ASC']],
    });

    return models.map(ResourceRoleMapper.toDomain);
  }

  async findByRoleIds(
    roleIds: number[],
  ): Promise<ResourceRole[]> {
    if (roleIds.length === 0) {
      return [];
    }

    const models = await ResourceRoleModel.findAll({
      where: {
        roleId: {
          [Op.in]: roleIds,
        },
        isActive: true,
        status: Status.ACTIVE,
      },
    });

    return models.map(ResourceRoleMapper.toDomain);
  }

  async findByResourceIdAndRoleId(
    resourceId: number,
    roleId: number,
  ): Promise<ResourceRole | null> {
    const model = await ResourceRoleModel.findOne({
      where: {
        resourceId,
        roleId,
      },
    });

    return model
      ? ResourceRoleMapper.toDomain(model)
      : null;
  }
}

export const resourceRoleRepositoryProvider = {
  provide: RESOURCE_ROLE_REPOSITORY,
  useClass: SequelizeResourceRoleRepository,
};
