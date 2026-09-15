import { Role } from '../entities/role.entity.js';

export const ROLE_REPOSITORY = 'ROLE_REPOSITORY';

export interface IRoleRepository {
  create(role: Role): Promise<Role>;

  findAll(): Promise<Role[]>;

  findById(id: number): Promise<Role | null>;

  findByName(name: string): Promise<Role | null>;

  findByIds(ids: number[]): Promise<Role[]>;

  update(id: number, data: Partial<Role>): Promise<Role>;

  delete(id: number): Promise<void>;
}
