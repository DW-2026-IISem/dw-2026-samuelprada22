import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class UserNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Usuario', identifier);
  }
}
