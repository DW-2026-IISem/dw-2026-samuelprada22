import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { Role } from '../../../domain/entities/role.entity';
import { ROLE_REPOSITORY } from '../../../domain/interfaces/role-repository.interface';
import type { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { RoleModel } from '../models/role.model';
import { RoleMapper } from '../../../application/mappers/role.mapper';

@Injectable()
export class SequelizeRoleRepository implements IRoleRepository {
  async create(role: Role): Promise<Role> {
    const model = await RoleModel.create(RoleMapper.toPersistence(role));
    return RoleMapper.toDomain(model);
  }

  async findAll(): Promise<Role[]> {
    const models = await RoleModel.findAll({ order: [['id', 'ASC']] });
    return models.map(RoleMapper.toDomain);
  }

  async findById(id: number): Promise<Role | null> {
    const model = await RoleModel.findByPk(id);
    return model ? RoleMapper.toDomain(model) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const model = await RoleModel.findOne({ where: { name } });
    return model ? RoleMapper.toDomain(model) : null;
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) return [];
    const models = await RoleModel.findAll({ where: { id: { [Op.in]: ids } } });
    return models.map(RoleMapper.toDomain);
  }

  async update(id: number, data: Partial<Role>): Promise<Role> {
    const model = await RoleModel.findByPk(id);
    if (!model) {
      throw new Error(`Role ${id} not found`);
    }
    await model.update(RoleMapper.toPersistence({ ...RoleMapper.toDomain(model), ...data }));
    return RoleMapper.toDomain(model);
  }

  async delete(id: number): Promise<void> {
    await RoleModel.destroy({ where: { id } });
  }
}

export const roleRepositoryProvider = {
  provide: ROLE_REPOSITORY,
  useClass: SequelizeRoleRepository,
};
