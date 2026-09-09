import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class MemberAlreadyExistsException extends DomainException {
  constructor(identifier: string) {
    super(`El socio '${identifier}' ya está registrado`);
  }
}
