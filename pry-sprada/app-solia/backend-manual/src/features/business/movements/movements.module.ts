import { Module } from '@nestjs/common';
import { MOVEMENT_REPOSITORY } from './domain/interfaces/movement-repository.interface.js';
import { MovementRepository } from './infrastructure/persistence/repositories/movement.repository.js';
import { CreateMovementUseCase } from './application/use-cases/create-movement.use-case.js';
import { UpdateMovementUseCase } from './application/use-cases/update-movement.use-case.js';
import { DeleteMovementUseCase } from './application/use-cases/delete-movement.use-case.js';
import { GetMovementUseCase } from './application/use-cases/get-movement.use-case.js';
import { ListMovementsUseCase } from './application/use-cases/list-movements.use-case.js';
import { MovementsController } from './presentation/http/controllers/movements.controller.js';

@Module({
  controllers: [MovementsController],
  providers: [
    MovementRepository,
    {
      provide: MOVEMENT_REPOSITORY,
      useExisting: MovementRepository,
    },
    CreateMovementUseCase,
    UpdateMovementUseCase,
    DeleteMovementUseCase,
    GetMovementUseCase,
    ListMovementsUseCase,
  ],
  exports: [MOVEMENT_REPOSITORY],
})
export class MovementsModule {}
