import { RoleUser } from '../entities/role-user.entity';

export const ROLE_USER_REPOSITORY = 'ROLE_USER_REPOSITORY';

export interface IRoleUserRepository {
  assign(roleUser: RoleUser): Promise<RoleUser>;
  revoke(id: number): Promise<void>;
  findByUserId(userId: number): Promise<RoleUser[]>;
  findByUserIdAndRoleId(userId: number, roleId: number): Promise<RoleUser | null>;
  findActiveByUserId(userId: number): Promise<RoleUser[]>;
}
