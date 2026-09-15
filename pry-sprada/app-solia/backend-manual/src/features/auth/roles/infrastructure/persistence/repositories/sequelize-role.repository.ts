import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import { Role } from '../../../domain/entities/role.entity.js';
import { ROLE_REPOSITORY } from '../../../domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../domain/interfaces/role-repository.interface.js';

import { RoleModel } from '../models/role.model.js';
import { RoleMapper } from '../../../application/mappers/role.mapper.js';

@Injectable()
export class SequelizeRoleRepository implements IRoleRepository {
  async create(role: Role): Promise<Role> {
    const model = await RoleModel.create(
      RoleMapper.toPersistence(role),
    );

    return RoleMapper.toDomain(model);
  }

  async findAll(): Promise<Role[]> {
    const models = await RoleModel.findAll({
      order: [['id', 'ASC']],
    });

    return models.map(RoleMapper.toDomain);
  }

  async findById(id: number): Promise<Role | null> {
    const model = await RoleModel.findByPk(id);

    return model ? RoleMapper.toDomain(model) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const model = await RoleModel.findOne({
      where: { name },
    });

    return model ? RoleMapper.toDomain(model) : null;
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) {
      return [];
    }

    const models = await RoleModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    return models.map(RoleMapper.toDomain);
  }

  async update(id: number, data: Partial<Role>): Promise<Role> {
    const model = await RoleModel.findByPk(id);

    if (!model) {
      throw new Error(`Role ${id} no encontrado`);
    }

    const currentRole = RoleMapper.toDomain(model);

    const updatedRole = Role.reconstitute({
      id: currentRole.id,
      name: data.name ?? currentRole.name,
      description: data.description ?? currentRole.description,
      isActive: data.isActive ?? currentRole.isActive,
      status: data.status ?? currentRole.status,
      createdAt: currentRole.createdAt,
      updatedAt: currentRole.updatedAt,
    });

    await model.update(
      RoleMapper.toPersistence(updatedRole),
    );

    return RoleMapper.toDomain(model);
  }

  async delete(id: number): Promise<void> {
    await RoleModel.destroy({
      where: { id },
    });
  }
}

export const roleRepositoryProvider = {
  provide: ROLE_REPOSITORY,
  useClass: SequelizeRoleRepository,
};
