import { Injectable } from '@nestjs/common';
import { Status } from '../../../../../../common/enums/status.enum';
import { RoleUser } from '../../../domain/entities/role-user.entity';
import { ROLE_USER_REPOSITORY } from '../../../domain/interfaces/role-user-repository.interface';
import type { IRoleUserRepository } from '../../../domain/interfaces/role-user-repository.interface';
import { RoleUserModel } from '../models/role-user.model';
import { RoleUserMapper } from '../../../application/mappers/role-user.mapper';

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
