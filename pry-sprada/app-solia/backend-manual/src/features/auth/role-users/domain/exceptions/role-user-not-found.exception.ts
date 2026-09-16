import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception';

export class RoleUserNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Asignación de rol', identifier);
  }
}
