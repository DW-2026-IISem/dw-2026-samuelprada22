import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Rate } from '../../../domain/entities/rate.entity.js';
import {
  IRateRepository,
  RateFindAllParams,
} from '../../../domain/interfaces/rate-repository.interface.js';
import { RateMapper } from '../../../application/mappers/rate.mapper.js';
import { RateModel } from '../models/rate.model.js';

@Injectable()
export class RateRepository implements IRateRepository {
  async create(rate: Rate): Promise<Rate> {
    const model = await RateModel.create(
      RateMapper.toPersistence(rate),
    );

    return RateMapper.toDomain(model);
  }

  async update(rate: Rate): Promise<Rate> {
    await RateModel.update(
      RateMapper.toPersistence(rate),
      {
        where: { id: rate.id },
      },
    );

    const updated = await RateModel.findByPk(rate.id!);

    return RateMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await RateModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Rate | null> {
    const model = await RateModel.findByPk(id);

    return model ? RateMapper.toDomain(model) : null;
  }

  async findAll(params: RateFindAllParams) {
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

    const { rows, count } = await RateModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => RateMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
