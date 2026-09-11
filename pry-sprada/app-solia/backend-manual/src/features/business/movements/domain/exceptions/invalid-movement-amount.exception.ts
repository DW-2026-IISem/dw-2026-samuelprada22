import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class InvalidMovementAmountException extends DomainException {
  constructor(amount: number) {
    super(`La cantidad '${amount}' debe ser mayor a 0`);
  }
}
