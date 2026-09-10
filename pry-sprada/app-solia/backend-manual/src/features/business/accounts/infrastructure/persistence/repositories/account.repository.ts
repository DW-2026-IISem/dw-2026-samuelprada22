import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Account } from '../../../domain/entities/account.entity.js';
import {
  IAccountRepository,
  AccountFindAllParams,
} from '../../../domain/interfaces/account-repository.interface.js';
import { AccountMapper } from '../../../application/mappers/account.mapper.js';
import { AccountModel } from '../models/account.model.js';

@Injectable()
export class AccountRepository implements IAccountRepository {
  async create(account: Account): Promise<Account> {
    const model = await AccountModel.create(
      AccountMapper.toPersistence(account),
    );

    return AccountMapper.toDomain(model);
  }

  async update(account: Account): Promise<Account> {
    await AccountModel.update(
      AccountMapper.toPersistence(account),
      {
        where: { id: account.id },
      },
    );

    const updated = await AccountModel.findByPk(account.id!);

    return AccountMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await AccountModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Account | null> {
    const model = await AccountModel.findByPk(id);

    return model ? AccountMapper.toDomain(model) : null;
  }

  async findAll(params: AccountFindAllParams) {
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

    const { rows, count } = await AccountModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => AccountMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
