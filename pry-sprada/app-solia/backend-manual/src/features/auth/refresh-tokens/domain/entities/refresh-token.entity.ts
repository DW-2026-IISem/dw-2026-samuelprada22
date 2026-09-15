export interface RefreshTokenProps {
  id?: number;
  userId: number;
  token: string;
  deviceInfo?: string;
  isValid?: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RefreshToken {
  id?: number;
  userId: number;
  token: string;
  deviceInfo?: string;
  isValid: boolean;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;

  private constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.deviceInfo = props.deviceInfo;
    this.isValid = props.isValid ?? true;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      RefreshTokenProps,
      'id' | 'isValid' | 'createdAt' | 'updatedAt'
    >,
  ): RefreshToken {
    if (!props.userId || props.userId <= 0) {
      throw new Error('El usuario del refresh token es requerido');
    }

    if (!props.token?.trim()) {
      throw new Error('El token es requerido');
    }

    if (!props.expiresAt) {
      throw new Error('La fecha de expiración es requerida');
    }

    return new RefreshToken(props);
  }

  static reconstitute(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  invalidate(): void {
    this.isValid = false;
  }

  isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }

  canBeUsed(): boolean {
    return this.isValid && !this.isExpired();
  }
}
