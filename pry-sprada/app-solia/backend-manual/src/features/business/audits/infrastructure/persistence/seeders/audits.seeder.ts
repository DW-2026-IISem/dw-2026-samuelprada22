import { AuditModel } from '../models/audit.model.js';

export async function seedAudits(): Promise<void> {
  const count = await AuditModel.count();

  if (count > 0) {
    return;
  }

  await AuditModel.create({
    actorUserId: 1,
    accion: 'CREACION',
    entidad: 'CreditApplication',
    entidadId: 1,
    datos: JSON.stringify({
      descripcion: 'Registro inicial de auditoría',
    }),
  });
}
