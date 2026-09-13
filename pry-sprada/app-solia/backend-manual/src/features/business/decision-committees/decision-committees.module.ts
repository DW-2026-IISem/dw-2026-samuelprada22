import { Module } from '@nestjs/common';

import {
  DECISION_COMMITTEE_REPOSITORY,
} from './domain/interfaces/decision-committee-repository.interface.js';

import { DecisionCommitteeRepository } from './infrastructure/persistence/repositories/decision-committee.repository.js';

import { CreateDecisionCommitteeUseCase } from './application/use-cases/create-decision-committee.use-case.js';
import { UpdateDecisionCommitteeUseCase } from './application/use-cases/update-decision-committee.use-case.js';
import { DeleteDecisionCommitteeUseCase } from './application/use-cases/delete-decision-committee.use-case.js';
import { GetDecisionCommitteeUseCase } from './application/use-cases/get-decision-committee.use-case.js';
import { ListDecisionCommitteesUseCase } from './application/use-cases/list-decision-committees.use-case.js';

import { DecisionCommitteesController } from './presentation/http/controllers/decision-committees.controller.js';

@Module({
  controllers: [DecisionCommitteesController],
  providers: [
    DecisionCommitteeRepository,
    {
      provide: DECISION_COMMITTEE_REPOSITORY,
      useExisting: DecisionCommitteeRepository,
    },
    CreateDecisionCommitteeUseCase,
    UpdateDecisionCommitteeUseCase,
    DeleteDecisionCommitteeUseCase,
    GetDecisionCommitteeUseCase,
    ListDecisionCommitteesUseCase,
  ],
  exports: [DECISION_COMMITTEE_REPOSITORY],
})
export class DecisionCommitteesModule {}
