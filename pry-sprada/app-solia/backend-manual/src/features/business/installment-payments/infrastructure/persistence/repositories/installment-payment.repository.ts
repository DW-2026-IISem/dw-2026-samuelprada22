import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { InstallmentPayment } from '../../../domain/entities/installment-payment.entity.js';
import {
  IInstallmentPaymentRepository,
  InstallmentPaymentFindAllParams,
} from '../../../domain/interfaces/installment-payment-repository.interface.js';
import { InstallmentPaymentMapper } from '../../../application/mappers/installment-payment.mapper.js';
import { InstallmentPaymentModel } from '../models/installment-payment.model.js';

@Injectable()
export class InstallmentPaymentRepository
  implements IInstallmentPaymentRepository
{
  async create(
    installmentPayment: InstallmentPayment,
  ): Promise<InstallmentPayment> {
    const model = await InstallmentPaymentModel.create(
      InstallmentPaymentMapper.toPersistence(installmentPayment),
    );

    return InstallmentPaymentMapper.toDomain(model);
  }

  async update(
    installmentPayment: InstallmentPayment,
  ): Promise<InstallmentPayment> {
    await InstallmentPaymentModel.update(
      InstallmentPaymentMapper.toPersistence(installmentPayment),
      {
        where: { id: installmentPayment.id },
      },
    );

    const updated = await InstallmentPaymentModel.findByPk(
      installmentPayment.id!,
    );

    return InstallmentPaymentMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await InstallmentPaymentModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<InstallmentPayment | null> {
    const model = await InstallmentPaymentModel.findByPk(id);

    return model
      ? InstallmentPaymentMapper.toDomain(model)
      : null;
  }

  async findAll(params: InstallmentPaymentFindAllParams) {
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
      await InstallmentPaymentModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

    return buildPaginatedResult(
      rows.map((row) =>
        InstallmentPaymentMapper.toDomain(row),
      ),
      count,
      page,
      limit,
    );
  }
}
