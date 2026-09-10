import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class AccountNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Cuenta', id);
  }
}
