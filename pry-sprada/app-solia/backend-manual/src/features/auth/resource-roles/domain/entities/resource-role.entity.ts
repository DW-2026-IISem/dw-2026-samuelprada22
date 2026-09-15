import { Status } from '../../../../../common/enums/status.enum.js';

export interface ResourceRoleProps {
  id?: number;
  resourceId: number;
  roleId: number;
  isActive?: boolean;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ResourceRole {
  id?: number;
  resourceId: number;
  roleId: number;
  isActive: boolean;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<ResourceRole>) {
    this.id = partial.id;
    this.resourceId = partial.resourceId;
    this.roleId = partial.roleId;
    this.isActive = partial.isActive ?? true;
    this.status = partial.status ?? Status.ACTIVE;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
  }
}
