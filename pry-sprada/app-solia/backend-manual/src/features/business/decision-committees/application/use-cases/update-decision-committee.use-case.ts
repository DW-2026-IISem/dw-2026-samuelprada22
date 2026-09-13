import { Inject, Injectable } from '@nestjs/common';

import {
  DECISION_COMMITTEE_REPOSITORY,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import type {
  IDecisionCommitteeRepository,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import { DecisionCommitteeNotFoundException } from '../../domain/exceptions/decision-committee-not-found.exception.js';
import { UpdateDecisionCommitteeDto } from '../dto/update-decision-committee.dto.js';

@Injectable()
export class UpdateDecisionCommitteeUseCase {
  constructor(
    @Inject(DECISION_COMMITTEE_REPOSITORY)
    private readonly repository: IDecisionCommitteeRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateDecisionCommitteeDto,
  ) {
    const decisionCommittee = await this.repository.findById(id);

    if (!decisionCommittee) {
      throw new DecisionCommitteeNotFoundException(id);
    }

    decisionCommittee.update(dto);

    return this.repository.update(decisionCommittee);
  }
}
