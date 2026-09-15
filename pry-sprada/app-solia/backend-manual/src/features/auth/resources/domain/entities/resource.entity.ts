import { Status } from '../../../../../common/enums/status.enum.js';

export interface ResourceProps {
  id?: number;
  path: string;
  method: string;
  isActive?: boolean;
  status?: Status;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Resource {
  id?: number;
  path: string;
  method: string;
  isActive: boolean;
  status: Status;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: ResourceProps) {
    this.id = props.id;
    this.path = props.path;
    this.method = props.method;
    this.isActive = props.isActive ?? true;
    this.status = props.status ?? Status.ACTIVE;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      ResourceProps,
      'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
    >,
  ): Resource {
    if (!props.path?.trim()) {
      throw new Error('El path del recurso es requerido');
    }

    if (!props.method?.trim()) {
      throw new Error('El método HTTP del recurso es requerido');
    }

    return new Resource(props);
  }

  static reconstitute(props: ResourceProps): Resource {
    return new Resource(props);
  }

  update(
    props: Partial<
      Omit<
        ResourceProps,
        'id' | 'isActive' | 'status' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.path !== undefined) {
      if (!props.path.trim()) {
        throw new Error('El path del recurso es requerido');
      }

      this.path = props.path;
    }

    if (props.method !== undefined) {
      if (!props.method.trim()) {
        throw new Error('El método HTTP del recurso es requerido');
      }

      this.method = props.method;
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
