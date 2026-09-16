import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface';
import { ROLE_USER_REPOSITORY } from '../../domain/interfaces/role-user-repository.interface';
import type { IRoleUserRepository } from '../../domain/interfaces/role-user-repository.interface';
import { RoleUserMapper } from '../mappers/role-user.mapper';

@Injectable()
export class ListRoleUsersByUserUseCase {
  constructor(
    @Inject(ROLE_USER_REPOSITORY)
    private readonly roleUserRepository: IRoleUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(userId: number) {
    const roleUsers = await this.roleUserRepository.findByUserId(userId);
    const roleIds = roleUsers.map((ru) => ru.roleId);
    const roles = await this.roleRepository.findByIds(roleIds);
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    return roleUsers.map((ru) => ({
      ...RoleUserMapper.toResponse(ru),
      roleName: roleMap.get(ru.roleId),
    }));
  }
}
