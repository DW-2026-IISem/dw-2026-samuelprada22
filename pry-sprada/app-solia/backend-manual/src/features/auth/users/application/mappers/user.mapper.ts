import { User } from '../../domain/entities/user.entity.js';
import { UserModel } from '../../infrastructure/persistence/models/user.model.js';

export class UserMapper {
  static toDomain(model: UserModel): User {
    return new User({
      id: model.id,
      username: model.username,
      email: model.email,
      password: model.password,
      isActive: model.isActive,
      avatar: model.avatar ?? undefined,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toPersistence(entity: User): Partial<UserModel> {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      password: entity.password,
      isActive: entity.isActive,
      avatar: entity.avatar ?? null,
    };
  }

  static toResponse(entity: User) {
    return {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      isActive: entity.isActive,
      avatar: entity.avatar,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
