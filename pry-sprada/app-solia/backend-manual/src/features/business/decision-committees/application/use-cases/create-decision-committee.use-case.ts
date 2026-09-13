import { Inject, Injectable } from '@nestjs/common';

import {
  DECISION_COMMITTEE_REPOSITORY,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import type {
  IDecisionCommitteeRepository,
} from '../../domain/interfaces/decision-committee-repository.interface.js';

import { DecisionCommittee } from '../../domain/entities/decision-committee.entity.js';
import type { CreateDecisionCommitteeDto } from '../dto/create-decision-committee.dto.js';

@Injectable()
export class CreateDecisionCommitteeUseCase {
  constructor(
    @Inject(DECISION_COMMITTEE_REPOSITORY)
    private readonly repository: IDecisionCommitteeRepository,
  ) {}

  async execute(
    dto: CreateDecisionCommitteeDto,
  ): Promise<DecisionCommittee> {
    const decisionCommittee = DecisionCommittee.create({
      referenceId: dto.referenceId,
      name: dto.name,
      description: dto.description,
    });

    return this.repository.create(decisionCommittee);
  }
}
