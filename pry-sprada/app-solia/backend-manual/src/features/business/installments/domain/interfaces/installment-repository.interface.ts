import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Installment } from '../entities/installment.entity.js';

export const INSTALLMENT_REPOSITORY = 'INSTALLMENT_REPOSITORY';

export interface InstallmentFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  creditId?: number;
}

export interface IInstallmentRepository {
  create(installment: Installment): Promise<Installment>;
  update(installment: Installment): Promise<Installment>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Installment | null>;
  findAll(
    params: InstallmentFindAllParams,
  ): Promise<PaginatedResult<Installment>>;
}
