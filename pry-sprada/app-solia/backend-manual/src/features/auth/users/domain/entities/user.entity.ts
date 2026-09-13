import { Status } from '../../../../../common/enums/status.enum.js';

export class User {
  id?: number;
  username: string;
  email: string;
  password: string;
  isActive: Status;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
