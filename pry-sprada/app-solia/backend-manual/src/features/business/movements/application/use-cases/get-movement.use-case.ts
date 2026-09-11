import { Inject, Injectable } from '@nestjs/common';
import { MovementNotFoundException } from '../../domain/exceptions/movement-not-found.exception.js';
import {
  type IMovementRepository,
  MOVEMENT_REPOSITORY,
} from '../../domain/interfaces/movement-repository.interface.js';
import { MovementMapper } from '../mappers/movement.mapper.js';

@Injectable()
export class GetMovementUseCase {
  constructor(
    @Inject(MOVEMENT_REPOSITORY)
    private readonly movementRepository: IMovementRepository,
  ) {}

  async execute(id: number) {
    const movement = await this.movementRepository.findById(id);

    if (!movement) {
      throw new MovementNotFoundException(id);
    }

    return MovementMapper.toResponse(movement);
  }
}
