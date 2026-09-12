import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class CreditNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Crédito', id);
  }
}
