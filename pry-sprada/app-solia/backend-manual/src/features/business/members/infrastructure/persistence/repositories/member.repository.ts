import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';
import { Member } from '../../../domain/entities/member.entity.js';
import {
  MemberFindAllParams,
  IMemberRepository,
} from '../../../domain/interfaces/member-repository.interface.js';
import { MemberMapper } from '../../../application/mappers/member.mapper.js';
import { MemberModel } from '../models/member.model.js';

@Injectable()
export class MemberRepository implements IMemberRepository {
  async create(member: Member): Promise<Member> {
    const model = await MemberModel.create(
      MemberMapper.toPersistence(member),
    );

    return MemberMapper.toDomain(model);
  }

  async update(member: Member): Promise<Member> {
    await MemberModel.update(MemberMapper.toPersistence(member), {
      where: { id: member.id },
    });

    const updated = await MemberModel.findByPk(member.id!);

    return MemberMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await MemberModel.destroy({
      where: { id },
    });
  }

  async findById(id: number): Promise<Member | null> {
    const model = await MemberModel.findByPk(id);

    return model ? MemberMapper.toDomain(model) : null;
  }

  async findAll(
    params: MemberFindAllParams,
  ) {
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

    const { rows, count } = await MemberModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => MemberMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
