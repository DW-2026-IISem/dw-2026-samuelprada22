import { RefreshToken } from '../../domain/entities/refresh-token.entity.js';
import { RefreshTokenModel } from '../../infrastructure/persistence/models/refresh-token.model.js';

export class RefreshTokenMapper {
  static toDomain(model: RefreshTokenModel): RefreshToken {
    return new RefreshToken({
      id: model.id,
      userId: model.userId,
      token: model.token,
      deviceInfo: model.deviceInfo ?? undefined,
      isValid: model.isValid,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: RefreshToken): Partial<RefreshTokenModel> {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      deviceInfo: entity.deviceInfo ?? null,
      isValid: entity.isValid,
      expiresAt: entity.expiresAt,
    };
  }
}
