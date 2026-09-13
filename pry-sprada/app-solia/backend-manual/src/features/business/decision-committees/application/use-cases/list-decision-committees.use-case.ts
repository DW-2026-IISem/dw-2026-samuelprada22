import { Inject, Injectable } from '@nestjs/common';

import {
  DECISION_COMMITTEE_REPOSITORY,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import type {
  IDecisionCommitteeRepository,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import { DecisionCommitteeFilterDto } from '../dto/decision-committee-filter.dto.js';

@Injectable()
export class ListDecisionCommitteesUseCase {
  constructor(
    @Inject(DECISION_COMMITTEE_REPOSITORY)
    private readonly repository: IDecisionCommitteeRepository,
  ) {}

  async execute(dto: DecisionCommitteeFilterDto) {
    return this.repository.findAll({
      page: dto.page,
      limit: dto.limit,
      search: dto.search,
    });
  }
}
