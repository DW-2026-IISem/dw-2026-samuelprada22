import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class MemberNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super('Socio', id);
  }
}
