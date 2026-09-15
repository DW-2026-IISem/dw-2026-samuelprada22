import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_REPOSITORY } from '../../domain/interfaces/resource-repository.interface.js';
import type { IResourceRepository } from '../../domain/interfaces/resource-repository.interface.js';

import { ResourceNotFoundException } from '../../domain/exceptions/resource-not-found.exception.js';

@Injectable()
export class DeleteResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.resourceRepository.findById(id);

    if (!existing) {
      throw new ResourceNotFoundException(id);
    }

    await this.resourceRepository.delete(id);
  }
}
