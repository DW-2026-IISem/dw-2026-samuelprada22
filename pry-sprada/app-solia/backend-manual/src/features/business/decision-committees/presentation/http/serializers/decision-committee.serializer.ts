import { DecisionCommitteeResponseDto } from '../../../application/dto/decision-committee-response.dto.js';
import { DecisionCommittee } from '../../../domain/entities/decision-committee.entity.js';

export class DecisionCommitteeSerializer {
  static serialize(
    decisionCommittee: DecisionCommittee,
  ): DecisionCommitteeResponseDto {
    return {
      id: decisionCommittee.id!,
      referenceId: decisionCommittee.referenceId,
      name: decisionCommittee.name,
      description: decisionCommittee.description,
      isActive: decisionCommittee.isActive,
      status: decisionCommittee.status,
      createdAt: decisionCommittee.createdAt!,
      updatedAt: decisionCommittee.updatedAt!,
    };
  }
}
