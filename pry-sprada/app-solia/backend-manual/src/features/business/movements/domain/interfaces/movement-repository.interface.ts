import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Movement } from '../entities/movement.entity.js';

export const MOVEMENT_REPOSITORY = 'MOVEMENT_REPOSITORY';

export interface MovementFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  referenceId?: number;
  type?: string;
}

export interface IMovementRepository {
  create(movement: Movement): Promise<Movement>;
  update(movement: Movement): Promise<Movement>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Movement | null>;
  findAll(
    params: MovementFindAllParams,
  ): Promise<PaginatedResult<Movement>>;
}
