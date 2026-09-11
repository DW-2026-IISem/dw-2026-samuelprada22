import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class CreditApplicationNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Solicitud de crédito', id);
  }
}
