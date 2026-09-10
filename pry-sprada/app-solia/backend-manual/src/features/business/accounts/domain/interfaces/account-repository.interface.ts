import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { Account } from '../entities/account.entity.js';

export const ACCOUNT_REPOSITORY = 'ACCOUNT_REPOSITORY';

export interface AccountFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IAccountRepository {
  create(account: Account): Promise<Account>;
  update(account: Account): Promise<Account>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Account | null>;
  findAll(params: AccountFindAllParams): Promise<PaginatedResult<Account>>;
}
