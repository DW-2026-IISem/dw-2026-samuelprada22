import { Module } from '@nestjs/common';

import {
  AUDIT_REPOSITORY,
} from './domain/interfaces/audit-repository.interface.js';

import { AuditRepository } from './infrastructure/persistence/repositories/audit.repository.js';

import { CreateAuditUseCase } from './application/use-cases/create-audit.use-case.js';
import { GetAuditUseCase } from './application/use-cases/get-audit.use-case.js';
import { ListAuditsUseCase } from './application/use-cases/list-audits.use-case.js';

import { AuditsController } from './presentation/http/controllers/audits.controller.js';

@Module({
  controllers: [AuditsController],
  providers: [
    AuditRepository,
    {
      provide: AUDIT_REPOSITORY,
      useExisting: AuditRepository,
    },
    CreateAuditUseCase,
    GetAuditUseCase,
    ListAuditsUseCase,
  ],
  exports: [AUDIT_REPOSITORY],
})
export class AuditsModule {}
