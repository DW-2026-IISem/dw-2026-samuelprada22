import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class MovementNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Movimiento', id);
  }
}
