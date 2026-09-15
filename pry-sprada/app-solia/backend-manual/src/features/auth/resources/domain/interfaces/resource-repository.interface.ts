import { Resource } from '../entities/resource.entity.js';

export const RESOURCE_REPOSITORY = 'RESOURCE_REPOSITORY';

export interface IResourceRepository {
  create(resource: Resource): Promise<Resource>;
  findAll(): Promise<Resource[]>;
  findById(id: number): Promise<Resource | null>;
  findByPathAndMethod(
    path: string,
    method: string,
  ): Promise<Resource | null>;
  update(
    id: number,
    data: Partial<Resource>,
  ): Promise<Resource>;
  delete(id: number): Promise<void>;
}
