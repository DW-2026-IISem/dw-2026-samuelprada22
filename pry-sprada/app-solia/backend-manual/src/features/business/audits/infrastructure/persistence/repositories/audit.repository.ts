import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';

import {
  buildPaginatedResult,
  normalizePagination,
} from '../../../../../../common/utils/pagination.util.js';

import { Audit } from '../../../domain/entities/audit.entity.js';

import {
  AuditFindAllParams,
  IAuditRepository,
} from '../../../domain/interfaces/audit-repository.interface.js';

import { AuditMapper } from '../../../application/mappers/audit.mapper.js';
import { AuditModel } from '../models/audit.model.js';

@Injectable()
export class AuditRepository implements IAuditRepository {
  async create(audit: Audit): Promise<Audit> {
    const model = await AuditModel.create(
      AuditMapper.toPersistence(audit),
    );

    return AuditMapper.toDomain(model);
  }

  async findById(id: number): Promise<Audit | null> {
    const model = await AuditModel.findByPk(id);

    return model
      ? AuditMapper.toDomain(model)
      : null;
  }

  async findAll(params: AuditFindAllParams) {
    const { page, limit, offset } = normalizePagination(
      params.page,
      params.limit,
    );

    const where: any = {};

    if (params.accion) {
      where.accion = {
        [Op.like]: `%${params.accion}%`,
      };
    }

    if (params.entidad) {
      where.entidad = {
        [Op.like]: `%${params.entidad}%`,
      };
    }

    if (params.entidadId !== undefined) {
      where.entidadId = params.entidadId;
    }

    const { rows, count } = await AuditModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return buildPaginatedResult(
      rows.map((row) => AuditMapper.toDomain(row)),
      count,
      page,
      limit,
    );
  }
}
