import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Installment } from '../../../domain/entities/installment.entity.js';
import {
  IInstallmentRepository,
  InstallmentFindAllParams,
} from '../../../domain/interfaces/installment-repository.interface.js';
import { InstallmentMapper } from '../../../application/mappers/installment.mapper.js';
import { InstallmentModel } from '../models/installment.model.js';

@Injectable()
export class InstallmentRepository implements IInstallmentRepository {
  async create(installment: Installment): Promise<Installment> {
    const model = await InstallmentModel.create(
      InstallmentMapper.toPersistence(installment),
    );

    return InstallmentMapper.toDomain(model);
  }

  async update(installment: Installment): Promise<Installment> {
    await InstallmentModel.update(
      InstallmentMapper.toPersistence(installment),
      {
        where: { id: installment.id },
      },
    );

    const updated = await InstallmentModel.findByPk(installment.id!);

    return InstallmentMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await InstallmentModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Installment | null> {
    const model = await InstallmentModel.findByPk(id);

    return model ? InstallmentMapper.toDomain(model) : null;
  }

  async findAll(params: InstallmentFindAllParams) {
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
      await InstallmentModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

    return buildPaginatedResult(
      rows.map((row) => InstallmentMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
