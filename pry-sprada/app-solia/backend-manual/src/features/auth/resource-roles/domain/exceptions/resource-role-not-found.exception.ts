import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ResourceRoleNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Permiso de recurso', identifier);
  }
}
