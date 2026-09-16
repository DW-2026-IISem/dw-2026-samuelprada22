import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class InactiveUserException extends DomainException {
  constructor() {
    super('Usuario inactivo');
  }
}
