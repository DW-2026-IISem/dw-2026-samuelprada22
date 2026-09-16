import { Injectable } from '@nestjs/common';
import { Status } from '../../../../../../common/enums/status.enum.js';
import { RoleUser } from '../../../domain/entities/role-user.entity.js';
import { ROLE_USER_REPOSITORY } from '../../../domain/interfaces/role-user-repository.interface.js';
import type { IRoleUserRepository } from '../../../domain/interfaces/role-user-repository.interface.js';
import { RoleUserModel } from '../models/role-user.model.js';
import { RoleUserMapper } from '../../../application/mappers/role-user.mapper.js';

@Injectable()
export class SequelizeRoleUserRepository implements IRoleUserRepository {
  async assign(roleUser: RoleUser): Promise<RoleUser> {
    const model = await RoleUserModel.create(RoleUserMapper.toPersistence(roleUser));
    return RoleUserMapper.toDomain(model);
  }

  async revoke(id: number): Promise<void> {
    await RoleUserModel.update(
      { isActive: Status.INACTIVE },
      { where: { id } },
    );
  }

  async findByUserId(userId: number): Promise<RoleUser[]> {
    const models = await RoleUserModel.findAll({
      where: { userId },
      order: [['id', 'ASC']],
    });
    return models.map(RoleUserMapper.toDomain);
  }

  async findByUserIdAndRoleId(
    userId: number,
    roleId: number,
  ): Promise<RoleUser | null> {
    const model = await RoleUserModel.findOne({ where: { userId, roleId } });
    return model ? RoleUserMapper.toDomain(model) : null;
  }

  async findActiveByUserId(userId: number): Promise<RoleUser[]> {
    const models = await RoleUserModel.findAll({
      where: { userId, isActive: Status.ACTIVE },
    });
    return models.map(RoleUserMapper.toDomain);
  }
}

export const roleUserRepositoryProvider = {
  provide: ROLE_USER_REPOSITORY,
  useClass: SequelizeRoleUserRepository,
};
