import { Status } from '../../../../../common/enums/status.enum';

export class RefreshToken {
  id?: number;
  userId: number;
  token: string;
  deviceInfo?: string;
  isValid: Status;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}
