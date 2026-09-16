import { Status } from '../../../../../common/enums/status.enum.js';

export interface ResourceRoleProps {
  id?: number;
  resourceId: number;
  roleId: number;
  isActive?: string;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ResourceRole {
  id?: number;
  resourceId: number;
  roleId: number;
  isActive: string;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: ResourceRoleProps) {
    this.id = props.id;
    this.resourceId = props.resourceId;
    this.roleId = props.roleId;
    this.isActive = props.isActive ?? '1';
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
