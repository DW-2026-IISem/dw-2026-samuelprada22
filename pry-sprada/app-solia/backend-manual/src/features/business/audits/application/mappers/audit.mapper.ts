import { Audit } from '../../domain/entities/audit.entity.js';
import { AuditModel } from '../../infrastructure/persistence/models/audit.model.js';

export class AuditMapper {
  static toDomain(model: AuditModel): Audit {
    return Audit.reconstitute({
      id: model.id,
      actorUserId: model.actorUserId,
      accion: model.accion,
      entidad: model.entidad,
      entidadId: model.entidadId,
      datos: model.datos ?? undefined,
      createdAt: model.createdAt,
    });
  }

  static toPersistence(
    audit: Audit,
  ): {
    id?: number;
    actorUserId: number;
    accion: string;
    entidad: string;
    entidadId: number;
    datos?: string;
    createdAt?: Date;
  } {
    return {
      id: audit.id,
      actorUserId: audit.actorUserId,
      accion: audit.accion,
      entidad: audit.entidad,
      entidadId: audit.entidadId,
      datos: audit.datos,
      createdAt: audit.createdAt,
    };
  }
}
