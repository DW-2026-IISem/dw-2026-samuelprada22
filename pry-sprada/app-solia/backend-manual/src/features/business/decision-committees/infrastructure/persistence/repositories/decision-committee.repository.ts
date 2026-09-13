import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';

import { DecisionCommittee } from '../../../domain/entities/decision-committee.entity.js';

import {
  DecisionCommitteeFindAllParams,
  IDecisionCommitteeRepository,
} from '../../../domain/interfaces/decision-committee-repository.interface.js';

import { DecisionCommitteeMapper } from '../../../application/mappers/decision-committee.mapper.js';
import { DecisionCommitteeModel } from '../models/decision-committee.model.js';

@Injectable()
export class DecisionCommitteeRepository
  implements IDecisionCommitteeRepository
{
  async create(
    decisionCommittee: DecisionCommittee,
  ): Promise<DecisionCommittee> {
    const model = await DecisionCommitteeModel.create(
      DecisionCommitteeMapper.toPersistence(decisionCommittee),
    );

    return DecisionCommitteeMapper.toDomain(model);
  }

  async update(
    decisionCommittee: DecisionCommittee,
  ): Promise<DecisionCommittee> {
    await DecisionCommitteeModel.update(
      DecisionCommitteeMapper.toPersistence(decisionCommittee),
      {
        where: {
          id: decisionCommittee.id,
        },
      },
    );

    const updated = await DecisionCommitteeModel.findByPk(
      decisionCommittee.id!,
    );

    return DecisionCommitteeMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await DecisionCommitteeModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<DecisionCommittee | null> {
    const model = await DecisionCommitteeModel.findByPk(id);

    return model
      ? DecisionCommitteeMapper.toDomain(model)
      : null;
  }

  async findAll(params: DecisionCommitteeFindAllParams) {
    const { page, limit, offset } = normalizePagination(
      params.page,
      params.limit,
    );

    const where = params.search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${params.search}%`,
              },
            },
            {
              description: {
                [Op.like]: `%${params.search}%`,
              },
            },
          ],
        }
      : {};

    const { rows, count } =
      await DecisionCommitteeModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

    return buildPaginatedResult(
      rows.map((row) =>
        DecisionCommitteeMapper.toDomain(row),
      ),
      count,
      page,
      limit,
    );
  }
}
