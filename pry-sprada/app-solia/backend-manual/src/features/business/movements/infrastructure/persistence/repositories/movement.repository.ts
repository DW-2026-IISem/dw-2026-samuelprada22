import { Injectable } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Movement } from '../../../domain/entities/movement.entity.js';
import {
  IMovementRepository,
  MovementFindAllParams,
} from '../../../domain/interfaces/movement-repository.interface.js';
import { MovementMapper } from '../../../application/mappers/movement.mapper.js';
import { MovementModel } from '../models/movement.model.js';

@Injectable()
export class MovementRepository implements IMovementRepository {
  async create(movement: Movement): Promise<Movement> {
    const model = await MovementModel.create(
      MovementMapper.toPersistence(movement),
    );

    return MovementMapper.toDomain(model);
  }

  async update(movement: Movement): Promise<Movement> {
    await MovementModel.update(
      MovementMapper.toPersistence(movement),
      {
        where: { id: movement.id },
      },
    );

    const updated = await MovementModel.findByPk(movement.id!);

    return MovementMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await MovementModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Movement | null> {
    const model = await MovementModel.findByPk(id);

    return model ? MovementMapper.toDomain(model) : null;
  }

  async findAll(params: MovementFindAllParams) {
    const { page, limit, offset } = normalizePagination(
      params.page,
      params.limit,
    );

    const where: WhereOptions = {};

    if (params.search) {
      Object.assign(where, {
        [Op.or]: [
          { type: { [Op.like]: `%${params.search}%` } },
          { observations: { [Op.like]: `%${params.search}%` } },
        ],
      });
    }

    if (params.referenceId) {
      where.referenceId = params.referenceId;
    }

    if (params.type) {
      where.type = params.type;
    }

    const { rows, count } = await MovementModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => MovementMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
