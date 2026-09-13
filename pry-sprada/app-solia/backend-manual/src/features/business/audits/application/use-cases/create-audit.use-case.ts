import { Inject, Injectable } from '@nestjs/common';

import {
  AUDIT_REPOSITORY,
} from '../../domain/interfaces/audit-repository.interface.js';

import type {
  IAuditRepository,
} from '../../domain/interfaces/audit-repository.interface.js';

import { Audit } from '../../domain/entities/audit.entity.js';
import { CreateAuditDto } from '../dto/create-audit.dto.js';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly repository: IAuditRepository,
  ) {}

  async execute(dto: CreateAuditDto): Promise<Audit> {
    const audit = Audit.create({
      actorUserId: dto.actorUserId,
      accion: dto.accion,
      entidad: dto.entidad,
      entidadId: dto.entidadId,
      datos: dto.datos,
    });

    return this.repository.create(audit);
  }
}
