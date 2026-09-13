import { Inject, Injectable } from '@nestjs/common';

import {
  AUDIT_REPOSITORY,
} from '../../domain/interfaces/audit-repository.interface.js';

import type {
  IAuditRepository,
} from '../../domain/interfaces/audit-repository.interface.js';

import { AuditFilterDto } from '../dto/audit-filter.dto.js';

@Injectable()
export class ListAuditsUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly repository: IAuditRepository,
  ) {}

  async execute(dto: AuditFilterDto) {
    return this.repository.findAll({
      page: dto.page,
      limit: dto.limit,
      accion: dto.accion,
      entidad: dto.entidad,
      entidadId: dto.entidadId,
    });
  }
}
