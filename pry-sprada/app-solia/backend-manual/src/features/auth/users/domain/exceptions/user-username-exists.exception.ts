import { DomainException } from '../../../../../common/exceptions/domain.exception.js';

export class UserUsernameExistsException extends DomainException {
  constructor(username: string) {
    super(`El username ${username} ya está registrado`);
  }
}
