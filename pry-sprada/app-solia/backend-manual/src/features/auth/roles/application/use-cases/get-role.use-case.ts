import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role-repository.interface';
import type { IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: number) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }
    return RoleMapper.toResponse(role);
  }
}
