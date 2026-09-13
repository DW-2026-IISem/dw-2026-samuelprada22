import { Injectable } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { CreditApplication } from '../../../domain/entities/credit-application.entity.js';
import {
  CreditApplicationFindAllParams,
  ICreditApplicationRepository,
} from '../../../domain/interfaces/credit-application-repository.interface.js';
import { CreditApplicationMapper } from '../../../application/mappers/credit-application.mapper.js';
import { CreditApplicationModel } from '../models/credit-application.model.js';

@Injectable()
export class CreditApplicationRepository
  implements ICreditApplicationRepository
{
  async create(
    creditApplication: CreditApplication,
  ): Promise<CreditApplication> {
    const model = await CreditApplicationModel.create(
      CreditApplicationMapper.toPersistence(creditApplication),
    );

    return CreditApplicationMapper.toDomain(model);
  }

  async update(
    creditApplication: CreditApplication,
  ): Promise<CreditApplication> {
    await CreditApplicationModel.update(
      CreditApplicationMapper.toPersistence(creditApplication),
      {
        where: { id: creditApplication.id },
      },
    );

    const updated = await CreditApplicationModel.findByPk(
      creditApplication.id!,
    );

    return CreditApplicationMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await CreditApplicationModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<CreditApplication | null> {
    const model = await CreditApplicationModel.findByPk(id);

    if (!model) {
      return null;
    }

    return CreditApplicationMapper.toDomain(model);
  }

  async findAll(params: CreditApplicationFindAllParams) {
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

    if (params.memberId) {
      where.memberId = params.memberId;
    }

    const { rows, count } =
      await CreditApplicationModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

    return buildPaginatedResult(
      rows.map((row) => CreditApplicationMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
