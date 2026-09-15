import { ResourceRole } from '../entities/resource-role.entity.js';

export const RESOURCE_ROLE_REPOSITORY = 'RESOURCE_ROLE_REPOSITORY';

export interface IResourceRoleRepository {
  assign(resourceRole: ResourceRole): Promise<ResourceRole>;

  revoke(id: number): Promise<void>;

  findAll(): Promise<ResourceRole[]>;

  findByRoleIds(roleIds: number[]): Promise<ResourceRole[]>;

  findByResourceIdAndRoleId(
    resourceId: number,
    roleId: number,
  ): Promise<ResourceRole | null>;
}
