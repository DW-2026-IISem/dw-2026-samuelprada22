import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { CreditApplication } from '../entities/credit-application.entity.js';

export const CREDIT_APPLICATION_REPOSITORY =
  'CREDIT_APPLICATION_REPOSITORY';

export interface CreditApplicationFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  memberId?: number;
}

export interface ICreditApplicationRepository {
  create(
    creditApplication: CreditApplication,
  ): Promise<CreditApplication>;

  update(
    creditApplication: CreditApplication,
  ): Promise<CreditApplication>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<CreditApplication | null>;

  findAll(
    params: CreditApplicationFindAllParams,
  ): Promise<PaginatedResult<CreditApplication>>;
}
