export class AuditResponseDto {
  id: number;
  actorUserId: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datos?: string;
  createdAt: Date;
}
