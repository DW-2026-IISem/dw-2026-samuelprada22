import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class RoleUserNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Asignación de rol', identifier);
  }
}
