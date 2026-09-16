import { Inject, Injectable } from '@nestjs/common';

import { AssignResourceRoleDto } from '../dto/assign-resource-role.dto.js';
import { ResourceRole } from '../../domain/entities/resource-role.entity.js';

import {
  RESOURCE_ROLE_REPOSITORY,
  type IResourceRoleRepository,
} from '../../domain/interfaces/resource-role-repository.interface.js';

@Injectable()
export class AssignResourceRoleUseCase {
  constructor(
    @Inject(RESOURCE_ROLE_REPOSITORY)
    private readonly resourceRoleRepository: IResourceRoleRepository,
  ) {}

  async execute(dto: AssignResourceRoleDto): Promise<ResourceRole> {
    const resourceRole = new ResourceRole({
      resourceId: dto.resourceId,
      roleId: dto.roleId,
      isActive:
        dto.isActive === undefined
          ? '1'
          : dto.isActive
            ? '1'
            : '0',
      status: dto.status,
    });

    return this.resourceRoleRepository.assign(resourceRole);
  }
}
