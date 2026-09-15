import { Inject, Injectable } from '@nestjs/common';

import {
  RESOURCE_ROLE_REPOSITORY,
} from '../../domain/interfaces/resource-role-repository.interface.js';
import type {
  IResourceRoleRepository,
} from '../../domain/interfaces/resource-role-repository.interface.js';

import { ResourceRoleNotFoundException } from '../../domain/exceptions/resource-role-not-found.exception.js';

@Injectable()
export class RevokeResourceRoleUseCase {
  constructor(
    @Inject(RESOURCE_ROLE_REPOSITORY)
    private readonly resourceRoleRepository: IResourceRoleRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing =
      await this.resourceRoleRepository.findAll();

    const resourceRole = existing.find(
      (item) => item.id === id,
    );

    if (!resourceRole) {
      throw new ResourceRoleNotFoundException(id);
    }

    await this.resourceRoleRepository.revoke(id);
  }
}
