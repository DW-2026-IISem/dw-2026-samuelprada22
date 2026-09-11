import { Inject, Injectable } from '@nestjs/common';
import { MovementNotFoundException } from '../../domain/exceptions/movement-not-found.exception.js';
import {
  type IMovementRepository,
  MOVEMENT_REPOSITORY,
} from '../../domain/interfaces/movement-repository.interface.js';

@Injectable()
export class DeleteMovementUseCase {
  constructor(
    @Inject(MOVEMENT_REPOSITORY)
    private readonly movementRepository: IMovementRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const movement = await this.movementRepository.findById(id);

    if (!movement) {
      throw new MovementNotFoundException(id);
    }

    await this.movementRepository.delete(id);
  }
}
