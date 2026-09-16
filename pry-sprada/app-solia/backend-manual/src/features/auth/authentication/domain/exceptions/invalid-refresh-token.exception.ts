import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class InvalidRefreshTokenException extends DomainException {
  constructor() {
    super('Refresh token inválido o expirado');
  }
}
