import { Inject, Injectable } from '@nestjs/common';

import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '../../domain/interfaces/role-repository.interface.js';

import { RoleNameExistsException } from '../../domain/exceptions/role-name-exists.exception.js';
import { Role } from '../../domain/entities/role.entity.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(dto.name);

    if (existingRole) {
      throw new RoleNameExistsException(dto.name);
    }

    const role = Role.create({
      name: dto.name,
      description: dto.description,
    });

    return this.roleRepository.create(role);
  }
}
