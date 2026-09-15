import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_REPOSITORY } from '../../domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../domain/interfaces/resource-repository.interface.js';

import { ResourceMapper } from '../mappers/resource.mapper.js';

@Injectable()
export class ListResourcesUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute() {
    const resources = await this.resourceRepository.findAll();

    return resources.map(ResourceMapper.toResponse);
  }
}
