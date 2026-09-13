import { Status } from '../../../../../common/enums/status.enum.js';

export interface CreditProps {
  id?: number;
  creditApplicationId: number;
  rateId: number;
  date: Date;
  amount: number;
  status?: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Credit {
  id?: number;
  creditApplicationId: number;
  rateId: number;
  date: Date;
  amount: number;
  status: Status;
  observations?: string;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: CreditProps) {
    this.id = props.id;
    this.creditApplicationId = props.creditApplicationId;
    this.rateId = props.rateId;
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
    if (!props.creditApplicationId || props.creditApplicationId <= 0) {
      throw new Error('La referencia del crédito es requerida');
    }

    if (!props.rateId || props.rateId <= 0) {
      throw new Error('La tasa del crédito es requerida');
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
    if (props.creditApplicationId !== undefined) {
      if (props.creditApplicationId <= 0) {
        throw new Error(
          'La referencia del crédito debe ser válida',
        );
      }

      this.creditApplicationId = props.creditApplicationId;
    }

    if (props.rateId !== undefined) {
      if (props.rateId <= 0) {
        throw new Error('La tasa del crédito debe ser válida');
      }

      this.rateId = props.rateId;
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
