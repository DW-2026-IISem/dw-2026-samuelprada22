import { PaginatedResult } from '../../../../../common/interfaces/pagination.interface.js';
import { DecisionCommittee } from '../entities/decision-committee.entity.js';

export const DECISION_COMMITTEE_REPOSITORY =
  'DECISION_COMMITTEE_REPOSITORY';

export interface DecisionCommitteeFindAllParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IDecisionCommitteeRepository {
  create(
    decisionCommittee: DecisionCommittee,
  ): Promise<DecisionCommittee>;

  update(
    decisionCommittee: DecisionCommittee,
  ): Promise<DecisionCommittee>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<DecisionCommittee | null>;

  findAll(
    params: DecisionCommitteeFindAllParams,
  ): Promise<PaginatedResult<DecisionCommittee>>;
}
