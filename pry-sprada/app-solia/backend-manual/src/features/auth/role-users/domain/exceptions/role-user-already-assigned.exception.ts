import { DomainException } from '../../../../../common/exceptions/domain.exception';

export class RoleUserAlreadyAssignedException extends DomainException {
  constructor(userId: number, roleId: number) {
    super(`El usuario ${userId} ya tiene asignado el rol ${roleId}`);
  }
}
