import { Status } from '../../../../../common/enums/status.enum.js';

export interface DecisionCommitteeProps {
  id?: number;
  referenceId: number;
  name: string;
  description?: string;
  isActive?: boolean;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DecisionCommittee {
  id?: number;
  referenceId: number;
  name: string;
  description?: string;
  isActive: boolean;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: DecisionCommitteeProps) {
    this.id = props.id;
    this.referenceId = props.referenceId;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive ?? true;
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      DecisionCommitteeProps,
      'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): DecisionCommittee {
    if (!props.referenceId || props.referenceId <= 0) {
      throw new Error(
        'La referencia de la solicitud de crédito es requerida',
      );
    }

    if (!props.name?.trim()) {
      throw new Error('El nombre de la decisión del comité es requerido');
    }

    return new DecisionCommittee(props);
  }

  static reconstitute(
    props: DecisionCommitteeProps,
  ): DecisionCommittee {
    return new DecisionCommittee(props);
  }

  update(
    props: Partial<
      Omit<
        DecisionCommitteeProps,
        'id' | 'referenceId' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error(
          'El nombre de la decisión del comité es requerido',
        );
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
