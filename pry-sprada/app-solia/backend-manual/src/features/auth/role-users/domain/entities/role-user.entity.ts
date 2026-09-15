import { Status } from '../../../../../common/enums/status.enum';

export class RoleUser {
  id?: number;
  roleId: number;
  userId: number;
  isActive: Status;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<RoleUser>) {
    Object.assign(this, partial);
  }
}
