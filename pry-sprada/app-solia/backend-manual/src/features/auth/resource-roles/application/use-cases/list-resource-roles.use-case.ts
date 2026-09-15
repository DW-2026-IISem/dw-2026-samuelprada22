import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_REPOSITORY } from '../../../resources/domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../../resources/domain/interfaces/resource-repository.interface.js';

import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface.js';

import {
  RESOURCE_ROLE_REPOSITORY,
} from '../../domain/interfaces/resource-role-repository.interface.js';
import type {
  IResourceRoleRepository,
} from '../../domain/interfaces/resource-role-repository.interface.js';

import { ResourceRoleMapper } from '../mappers/resource-role.mapper.js';

@Injectable()
export class ListResourceRolesUseCase {
  constructor(
    @Inject(RESOURCE_ROLE_REPOSITORY)
    private readonly resourceRoleRepository: IResourceRoleRepository,

    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute() {
    const resourceRoles =
      await this.resourceRoleRepository.findAll();

    const resources =
      await this.resourceRepository.findAll();

    const roles =
      await this.roleRepository.findAll();

    const resourceMap = new Map(
      resources.map((resource) => [resource.id, resource]),
    );

    const roleMap = new Map(
      roles.map((role) => [role.id, role]),
    );

    return resourceRoles.map((resourceRole) => ({
      ...ResourceRoleMapper.toResponse(resourceRole),
      resource: resourceMap.get(resourceRole.resourceId),
      role: roleMap.get(resourceRole.roleId),
    }));
  }
}
