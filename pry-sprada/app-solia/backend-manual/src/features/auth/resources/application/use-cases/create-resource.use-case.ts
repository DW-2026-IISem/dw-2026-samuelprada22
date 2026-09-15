import { Inject, Injectable } from '@nestjs/common';

import { Resource } from '../../domain/entities/resource.entity.js';

import {
  RESOURCE_REPOSITORY,
  type IResourceRepository,
} from '../../domain/interfaces/resource-repository.interface.js';

import { CreateResourceDto } from '../dto/create-resource.dto.js';
import { ResourceMapper } from '../mappers/resource.mapper.js';

@Injectable()
export class CreateResourceUseCase {
  constructor(
    @Inject(RESOURCE_REPOSITORY)
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async execute(dto: CreateResourceDto) {
    const resource = Resource.create({
      path: dto.path,
      method: dto.method,
    });

    const created = await this.resourceRepository.create(resource);

    return ResourceMapper.toResponse(created);
  }
}
