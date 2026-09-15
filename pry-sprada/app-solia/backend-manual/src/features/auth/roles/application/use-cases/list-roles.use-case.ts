import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../domain/interfaces/role-repository.interface.js';
import { RoleMapper } from '../mappers/role.mapper.js';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute() {
    const roles = await this.roleRepository.findAll();
    return roles.map(RoleMapper.toResponse);
  }
}
