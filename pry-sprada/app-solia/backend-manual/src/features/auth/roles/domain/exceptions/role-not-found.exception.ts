import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception';

export class RoleNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Rol', identifier);
  }
}
