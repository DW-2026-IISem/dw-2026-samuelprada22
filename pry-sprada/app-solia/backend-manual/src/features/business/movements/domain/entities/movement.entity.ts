import { Status } from '../../../../../common/enums/status.enum.js';

export interface MovementProps {
  id?: number;
  referenceId: number;
  type: string;
  date: Date;
  amount: number;
  observations?: string;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Movement {
  id?: number;
  referenceId: number;
  type: string;
  date: Date;
  amount: number;
  observations?: string;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: MovementProps) {
    this.id = props.id;
    this.referenceId = props.referenceId;
    this.type = props.type;
    this.date = props.date;
    this.amount = props.amount;
    this.observations = props.observations;
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      MovementProps,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): Movement {
    if (!props.referenceId || props.referenceId <= 0) {
      throw new Error('La referencia del movimiento es requerida');
    }

    if (!props.type?.trim()) {
      throw new Error('El tipo de movimiento es requerido');
    }

    if (!props.date) {
      throw new Error('La fecha del movimiento es requerida');
    }

    if (props.amount <= 0) {
      throw new Error('La cantidad del movimiento debe ser mayor que cero');
    }

    return new Movement(props);
  }

  static reconstitute(props: MovementProps): Movement {
    return new Movement(props);
  }

  update(
    props: Partial<
      Omit<
        MovementProps,
        'id' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.referenceId !== undefined) {
      if (props.referenceId <= 0) {
        throw new Error('La referencia del movimiento debe ser válida');
      }

      this.referenceId = props.referenceId;
    }

    if (props.type !== undefined) {
      if (!props.type.trim()) {
        throw new Error('El tipo de movimiento es requerido');
      }

      this.type = props.type;
    }

    if (props.date !== undefined) {
      this.date = props.date;
    }

    if (props.amount !== undefined) {
      if (props.amount <= 0) {
        throw new Error('La cantidad del movimiento debe ser mayor que cero');
      }

      this.amount = props.amount;
    }

    if (props.observations !== undefined) {
      this.observations = props.observations;
    }
  }

  deactivate(): void {
    this.status = Status.INACTIVE;
  }

  activate(): void {
    this.status = Status.ACTIVE;
  }
}
