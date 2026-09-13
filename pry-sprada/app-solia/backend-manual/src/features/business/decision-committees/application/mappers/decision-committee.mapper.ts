import { DecisionCommittee } from '../../domain/entities/decision-committee.entity.js';
import { DecisionCommitteeModel } from '../../infrastructure/persistence/models/decision-committee.model.js';

export class DecisionCommitteeMapper {
  static toDomain(
    model: DecisionCommitteeModel,
  ): DecisionCommittee {
    return DecisionCommittee.reconstitute({
      id: model.id,
      referenceId: model.referenceId,
      name: model.name,
      description: model.description ?? undefined,
      isActive: model.isActive,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(
    decisionCommittee: DecisionCommittee,
  ): {
    id?: number;
    referenceId: number;
    name: string;
    description?: string;
    isActive: boolean;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: decisionCommittee.id,
      referenceId: decisionCommittee.referenceId,
      name: decisionCommittee.name,
      description: decisionCommittee.description,
      isActive: decisionCommittee.isActive,
      status: decisionCommittee.status,
      createdAt: decisionCommittee.createdAt,
      updatedAt: decisionCommittee.updatedAt,
    };
  }
}
