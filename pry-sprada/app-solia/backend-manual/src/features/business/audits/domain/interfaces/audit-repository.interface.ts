import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Audit } from '../entities/audit.entity.js';

export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';

export interface AuditFindAllParams {
  page?: number;
  limit?: number;
  accion?: string;
  entidad?: string;
  entidadId?: number;
}

export interface IAuditRepository {
  create(audit: Audit): Promise<Audit>;

  findById(id: number): Promise<Audit | null>;

  findAll(
    params: AuditFindAllParams,
  ): Promise<PaginatedResult<Audit>>;
}
