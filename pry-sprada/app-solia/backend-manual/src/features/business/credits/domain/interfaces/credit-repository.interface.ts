import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Credit } from '../entities/credit.entity.js';

export const CREDIT_REPOSITORY = 'CREDIT_REPOSITORY';

export interface CreditFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  referenceId?: number;
}

export interface ICreditRepository {
  create(credit: Credit): Promise<Credit>;

  update(credit: Credit): Promise<Credit>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<Credit | null>;

  findAll(
    params: CreditFindAllParams,
  ): Promise<PaginatedResult<Credit>>;
}
