import { Injectable } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Credit } from '../../../domain/entities/credit.entity.js';
import {
  CreditFindAllParams,
  ICreditRepository,
} from '../../../domain/interfaces/credit-repository.interface.js';
import { CreditMapper } from '../../../application/mappers/credit.mapper.js';
import { CreditModel } from '../models/credit.model.js';

@Injectable()
export class CreditRepository implements ICreditRepository {
  async create(credit: Credit): Promise<Credit> {
    const model = await CreditModel.create(
      CreditMapper.toPersistence(credit),
    );

    return CreditMapper.toDomain(model);
  }

  async update(credit: Credit): Promise<Credit> {
    await CreditModel.update(
      CreditMapper.toPersistence(credit),
      {
        where: { id: credit.id },
      },
    );

    const updated = await CreditModel.findByPk(credit.id!);

    return CreditMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await CreditModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Credit | null> {
    const model = await CreditModel.findByPk(id);

    return model ? CreditMapper.toDomain(model) : null;
  }

  async findAll(params: CreditFindAllParams) {
    const { page, limit, offset } = normalizePagination(
      params.page,
      params.limit,
    );

    const where: WhereOptions = {};

    if (params.search) {
      Object.assign(where, {
        [Op.or]: [
          {
            observations: {
              [Op.like]: `%${params.search}%`,
            },
          },
        ],
      });
    }

    if (params.creditApplicationId) {
      where.creditApplicationId = params.creditApplicationId;
    }

    if (params.rateId) {
      where.rateId = params.rateId;
    }

    const { rows, count } = await CreditModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => CreditMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
