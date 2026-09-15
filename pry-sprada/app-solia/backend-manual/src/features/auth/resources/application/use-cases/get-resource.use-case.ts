import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_REPOSITORY } from '../../domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../domain/interfaces/resource-repository.interface.js';

import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception.js';

import { ResourceMapper } from '../mappers/resource.mapper.js';

@Injectable()
export class GetResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute(id: number) {
    const resource = await this.resourceRepository.findById(id);

    if (!resource) {
      throw new ResourceNotFoundException(id);
    }

    return ResourceMapper.toResponse(resource);
  }
}
