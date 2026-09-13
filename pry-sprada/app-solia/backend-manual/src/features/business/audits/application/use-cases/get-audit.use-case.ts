import { Inject, Injectable } from '@nestjs/common';

import {
  AUDIT_REPOSITORY,
} from '../../domain/interfaces/audit-repository.interface.js';

import type {
  IAuditRepository,
} from '../../domain/interfaces/audit-repository.interface.js';

import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

@Injectable()
export class GetAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly repository: IAuditRepository,
  ) {}

  async execute(id: number) {
    const audit = await this.repository.findById(id);

    if (!audit) {
      throw new EntityNotFoundException('Auditoría', id);
    }

    return audit;
  }
}
