import { Status } from '../../../../../common/enums/status.enum.js';

export interface InstallmentProps {
  id?: number;
  creditId: number;
  name: string;
  description?: string;
  isActive?: boolean;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Installment {
  id?: number;
  creditId: number;
  name: string;
  description?: string;
  isActive: boolean;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: InstallmentProps) {
    this.id = props.id;
    this.creditId = props.creditId;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive ?? true;
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      InstallmentProps,
      'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): Installment {
    if (!props.creditId || props.creditId <= 0) {
      throw new Error('El crédito es requerido');
    }

    if (!props.name?.trim()) {
      throw new Error('El nombre de la cuota es requerido');
    }

    return new Installment(props);
  }

  static reconstitute(props: InstallmentProps): Installment {
    return new Installment(props);
  }

  update(
    props: Partial<
      Omit<
        InstallmentProps,
        'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.creditId !== undefined) {
      if (props.creditId <= 0) {
        throw new Error('El crédito debe ser válido');
      }

      this.creditId = props.creditId;
    }

    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('El nombre de la cuota es requerido');
      }

      this.name = props.name;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }
  }

  deactivate(): void {
    this.isActive = false;
    this.status = Status.INACTIVE;
  }

  activate(): void {
    this.isActive = true;
    this.status = Status.ACTIVE;
  }
}
