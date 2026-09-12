import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class InstallmentNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Cuota', id);
  }
}
