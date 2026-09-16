import { Inject, Injectable } from '@nestjs/common';
import { Status } from '../../../../../common/enums/status.enum.js';
import { RoleNotFoundException } from '../../../roles/domain/exceptions/role-not-found.exception.js';
import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface.js';
import { UserNotFoundException } from '../../../users/domain/exceptions/user-not-found.exception.js';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface.js';
import { RoleUser } from '../../domain/entities/role-user.entity.js';
import { RoleUserAlreadyAssignedException } from '../../domain/exceptions/role-user-already-assigned.exception.js';
import { ROLE_USER_REPOSITORY } from '../../domain/interfaces/role-user-repository.interface.js';
import type { IRoleUserRepository } from '../../domain/interfaces/role-user-repository.interface.js';
import { AssignRoleUserDto } from '../dto/assign-role-user.dto.js';
import { RoleUserMapper } from '../mappers/role-user.mapper.js';

@Injectable()
export class AssignRoleUserUseCase {
  constructor(
    @Inject(ROLE_USER_REPOSITORY)
    private readonly roleUserRepository: IRoleUserRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: AssignRoleUserDto) {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundException(dto.userId);
    }

    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new RoleNotFoundException(dto.roleId);
    }

    const existing = await this.roleUserRepository.findByUserIdAndRoleId(
      dto.userId,
      dto.roleId,
    );

if (existing && existing.isActive === Status.ACTIVE) {
      throw new RoleUserAlreadyAssignedException(dto.userId, dto.roleId);
    }

    const roleUser = new RoleUser({
      roleId: dto.roleId,
      userId: dto.userId,
isActive: dto.isActive ?? Status.ACTIVE,
    });

    const assigned = await this.roleUserRepository.assign(roleUser);
    return RoleUserMapper.toResponse(assigned);
  }
}
