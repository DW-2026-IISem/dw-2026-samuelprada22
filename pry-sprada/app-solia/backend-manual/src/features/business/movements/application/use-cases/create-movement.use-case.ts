import { Inject, Injectable } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import {
  type IMovementRepository,
  MOVEMENT_REPOSITORY,
} from '../../domain/interfaces/movement-repository.interface.js';
import { CreateMovementDto } from '../dto/create-movement.dto.js';
import { MovementMapper } from '../mappers/movement.mapper.js';

@Injectable()
export class CreateMovementUseCase {
  constructor(
    @Inject(MOVEMENT_REPOSITORY)
    private readonly movementRepository: IMovementRepository,
  ) {}

  async execute(dto: CreateMovementDto) {
    const movement = Movement.create({
      referenceId: dto.referenceId,
      type: dto.type,
      date: new Date(dto.date),
      amount: dto.amount,
      observations: dto.observations,
    });

    const created = await this.movementRepository.create(movement);

    return MovementMapper.toResponse(created);
  }
}
