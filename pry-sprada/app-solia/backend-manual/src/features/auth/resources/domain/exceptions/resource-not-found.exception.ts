import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ResourceNotFoundException extends EntityNotFoundException {
  constructor(identifier: string | number) {
    super('Recurso', identifier);
  }
}
