import { Inject, Injectable } from '@nestjs/common';
import { MovementNotFoundException } from '../../domain/exceptions/movement-not-found.exception.js';
import {
  type IMovementRepository,
  MOVEMENT_REPOSITORY,
} from '../../domain/interfaces/movement-repository.interface.js';
import { UpdateMovementDto } from '../dto/update-movement.dto.js';
import { MovementMapper } from '../mappers/movement.mapper.js';

@Injectable()
export class UpdateMovementUseCase {
  constructor(
    @Inject(MOVEMENT_REPOSITORY)
    private readonly movementRepository: IMovementRepository,
  ) {}

  async execute(id: number, dto: UpdateMovementDto) {
    const movement = await this.movementRepository.findById(id);

    if (!movement) {
      throw new MovementNotFoundException(id);
    }

    movement.update({
      accountId: dto.accountId,
      type: dto.type,
      date: dto.date ? new Date(dto.date) : undefined,
      amount: dto.amount,
      observations: dto.observations,
    });

    const updated = await this.movementRepository.update(movement);

    return MovementMapper.toResponse(updated);
  }
}
