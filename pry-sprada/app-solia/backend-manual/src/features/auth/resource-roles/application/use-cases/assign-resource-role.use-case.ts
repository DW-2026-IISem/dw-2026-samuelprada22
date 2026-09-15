import { Inject, Injectable } from '@nestjs/common';

import { Status } from '../../../../../common/enums/status.enum.js';

import { ResourceNotFoundException } from '../../../resources/domain/exceptions/resource-not-found.exception.js';
import { RESOURCE_REPOSITORY } from '../../../resources/domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../../resources/domain/interfaces/resource-repository.interface.js';

import { RoleNotFoundException } from '../../../roles/domain/exceptions/role-not-found.exception.js';
import { ROLE_REPOSITORY } from '../../../roles/domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../../roles/domain/interfaces/role-repository.interface.js';

import { ResourceRole } from '../../domain/entities/resource-role.entity.js';
import {
  RESOURCE_ROLE_REPOSITORY,
} from '../../domain/interfaces/resource-role-repository.interface.js';
import type {
  IResourceRoleRepository,
} from '../../domain/interfaces/resource-role-repository.interface.js';

import { AssignResourceRoleDto } from '../dto/assign-resource-role.dto.js';
import { ResourceRoleMapper } from '../mappers/resource-role.mapper.js';

@Injectable()
export class AssignResourceRoleUseCase {
  constructor(
    @Inject(RESOURCE_ROLE_REPOSITORY)
    private readonly resourceRoleRepository: IResourceRoleRepository,

    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: AssignResourceRoleDto) {
    const resource = await this.resourceRepository.findById(
      dto.resourceId,
    );

    if (!resource) {
      throw new ResourceNotFoundException(dto.resourceId);
    }

    const role = await this.roleRepository.findById(dto.roleId);

    if (!role) {
      throw new RoleNotFoundException(dto.roleId);
    }

    const resourceRole = new ResourceRole({
      resourceId: dto.resourceId,
      roleId: dto.roleId,
      isActive: dto.isActive ?? true,
      status: dto.status ?? Status.ACTIVE,
    });

    const assigned =
      await this.resourceRoleRepository.assign(resourceRole);

    return ResourceRoleMapper.toResponse(assigned);
  }
}
