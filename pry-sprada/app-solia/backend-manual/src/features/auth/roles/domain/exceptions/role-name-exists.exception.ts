import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class RoleNameExistsException extends DomainException {
  constructor(name: string) {
    super(`El rol ${name} ya existe`);
  }
}
