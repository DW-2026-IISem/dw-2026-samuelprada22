import { AuditResponseDto } from '../../../application/dto/audit-response.dto.js';
import { Audit } from '../../../domain/entities/audit.entity.js';

export class AuditSerializer {
  static serialize(audit: Audit): AuditResponseDto {
    return {
      id: audit.id!,
      actorUserId: audit.actorUserId,
      accion: audit.accion,
      entidad: audit.entidad,
      entidadId: audit.entidadId,
      datos: audit.datos,
      createdAt: audit.createdAt!,
    };
  }
}
