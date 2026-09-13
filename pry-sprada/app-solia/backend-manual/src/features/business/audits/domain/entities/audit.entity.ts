export interface AuditProps {
  id?: number;
  actorUserId: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datos?: string;
  createdAt?: Date;
}

export class Audit {
  id?: number;
  actorUserId: number;
  accion: string;
  entidad: string;
  entidadId: number;
  datos?: string;
  createdAt?: Date;

  private constructor(props: AuditProps) {
    this.id = props.id;
    this.actorUserId = props.actorUserId;
    this.accion = props.accion;
    this.entidad = props.entidad;
    this.entidadId = props.entidadId;
    this.datos = props.datos;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AuditProps, 'id' | 'createdAt'>,
  ): Audit {
    if (!props.actorUserId || props.actorUserId <= 0) {
      throw new Error('El usuario que realiza la acción es requerido');
    }

    if (!props.accion?.trim()) {
      throw new Error('La acción de auditoría es requerida');
    }

    if (!props.entidad?.trim()) {
      throw new Error('La entidad de auditoría es requerida');
    }

    if (!props.entidadId || props.entidadId <= 0) {
      throw new Error('El ID de la entidad es requerido');
    }

    return new Audit(props);
  }

  static reconstitute(props: AuditProps): Audit {
    return new Audit(props);
  }
}
