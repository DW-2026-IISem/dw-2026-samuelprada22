import { Inject, Injectable } from '@nestjs/common';
import {
  type IMovementRepository,
  MOVEMENT_REPOSITORY,
} from '../../domain/interfaces/movement-repository.interface.js';
import { MovementFilterDto } from '../dto/movement-filter.dto.js';
import { MovementMapper } from '../mappers/movement.mapper.js';

@Injectable()
export class ListMovementsUseCase {
  constructor(
    @Inject(MOVEMENT_REPOSITORY)
    private readonly movementRepository: IMovementRepository,
  ) {}

  async execute(filter: MovementFilterDto) {
    const result = await this.movementRepository.findAll(filter);

    return {
      items: result.items.map((movement) =>
        MovementMapper.toResponse(movement),
      ),
      meta: result.meta,
    };
  }
}
