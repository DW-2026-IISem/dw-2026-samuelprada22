import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Credenciales inválidas');
  }
}
