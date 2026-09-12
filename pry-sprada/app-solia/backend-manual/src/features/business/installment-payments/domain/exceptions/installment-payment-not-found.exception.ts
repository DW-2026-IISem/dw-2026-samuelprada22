import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class InstallmentPaymentNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Pago de cuota', id);
  }
}
