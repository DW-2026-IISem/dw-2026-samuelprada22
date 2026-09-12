import { Status } from '../../../../../common/enums/status.enum.js';

export interface CreditProps {
  id?: number;
  referenceId: number;
  date: Date;
  amount: number;
  status?: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Credit {
  id?: number;
  referenceId: number;
  date: Date;
  amount: number;
  status: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: CreditProps) {
    this.id = props.id;
    this.referenceId = props.referenceId;
    this.date = props.date;
    this.amount = props.amount;
    this.status = props.status ?? Status.ACTIVE;
    this.observations = props.observations;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      CreditProps,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): Credit {
    if (!props.referenceId || props.referenceId <= 0) {
      throw new Error('La referencia del crédito es requerida');
    }

    if (!props.date) {
      throw new Error('La fecha del crédito es requerida');
    }

    if (props.amount <= 0) {
      throw new Error('El valor del crédito debe ser mayor que cero');
    }

    return new Credit(props);
  }

  static reconstitute(props: CreditProps): Credit {
    return new Credit(props);
  }

  update(
    props: Partial<
      Omit<
        CreditProps,
        'id' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.referenceId !== undefined) {
      if (props.referenceId <= 0) {
        throw new Error(
          'La referencia del crédito debe ser válida',
        );
      }

      this.referenceId = props.referenceId;
    }

    if (props.date !== undefined) {
      this.date = props.date;
    }

    if (props.amount !== undefined) {
      if (props.amount <= 0) {
        throw new Error(
          'El valor del crédito debe ser mayor que cero',
        );
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
