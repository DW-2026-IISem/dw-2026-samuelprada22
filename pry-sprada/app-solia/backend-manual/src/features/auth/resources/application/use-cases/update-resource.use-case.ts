import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_REPOSITORY } from '../../domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../domain/interfaces/resource-repository.interface.js';

import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception.js';

import { UpdateResourceDto } from '../dto/create-resource.dto.js';
import { ResourceMapper } from '../mappers/resource.mapper.js';

@Injectable()
export class UpdateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute(id: number, dto: UpdateResourceDto) {
    const existing = await this.resourceRepository.findById(id);

    if (!existing) {
      throw new ResourceNotFoundException(id);
    }

    const updated = await this.resourceRepository.update(id, dto);

    return ResourceMapper.toResponse(updated);
  }
}
