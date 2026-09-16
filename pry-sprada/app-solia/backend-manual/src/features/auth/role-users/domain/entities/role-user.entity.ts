import { Status } from '../../../../../common/enums/status.enum.js';

export class RoleUser {
  id?: number;
  roleId: number;
  userId: number;
  isActive: Status;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: {
    id?: number;
    roleId: number;
    userId: number;
    isActive?: Status;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.userId = data.userId;
    this.isActive = data.isActive ?? Status.ACTIVE;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
