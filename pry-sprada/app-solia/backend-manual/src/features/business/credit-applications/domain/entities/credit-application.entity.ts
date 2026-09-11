import { Status } from '../../../../../common/enums/status.enum.js';

export interface CreditApplicationProps {
  id?: number;
  referenceId: number;
  date: Date;
  amount: number;
  status?: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditApplication {
  id?: number;
  referenceId: number;
  date: Date;
  amount: number;
  status: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: CreditApplicationProps) {
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
      CreditApplicationProps,
      'id' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): CreditApplication {
    if (!props.referenceId || props.referenceId <= 0) {
      throw new Error('La referencia de la solicitud de crédito es requerida');
    }

    if (!props.date) {
      throw new Error('La fecha de la solicitud de crédito es requerida');
    }

    if (props.amount <= 0) {
      throw new Error(
        'El valor de la solicitud de crédito debe ser mayor que cero',
      );
    }

    return new CreditApplication(props);
  }

  static reconstitute(props: CreditApplicationProps): CreditApplication {
    return new CreditApplication(props);
  }

  update(
    props: Partial<
      Omit<
        CreditApplicationProps,
        'id' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.referenceId !== undefined) {
      if (props.referenceId <= 0) {
        throw new Error(
          'La referencia de la solicitud de crédito debe ser válida',
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
          'El valor de la solicitud de crédito debe ser mayor que cero',
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
