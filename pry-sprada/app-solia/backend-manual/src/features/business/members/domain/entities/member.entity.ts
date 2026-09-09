import { Status } from '../../../../../common/enums/status.enum.js';

export interface MemberProps {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Member {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: MemberProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive ?? true;
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      MemberProps,
      'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): Member {
    if (!props.name?.trim()) {
      throw new Error('El nombre del socio es requerido');
    }

    return new Member(props);
  }

  static reconstitute(props: MemberProps): Member {
    return new Member(props);
  }

  update(
    props: Partial<
      Omit<
        MemberProps,
        'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.name !== undefined) {
      if (!props.name.trim()) {
        throw new Error('El nombre del socio es requerido');
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
