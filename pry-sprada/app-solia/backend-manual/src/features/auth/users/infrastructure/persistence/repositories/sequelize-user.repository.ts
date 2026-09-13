import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity.js';
import { USER_REPOSITORY } from '../../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../../domain/interfaces/user-repository.interface.js';
import { UserModel } from '../models/user.model.js';
import { UserMapper } from '../../../application/mappers/user.mapper.js';

@Injectable()
export class SequelizeUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const model = await UserModel.create(UserMapper.toPersistence(user));
    return UserMapper.toDomain(model);
  }

  async findAll(): Promise<User[]> {
    const models = await UserModel.findAll({
      order: [['id', 'ASC']],
    });

    return models.map(UserMapper.toDomain);
  }

  async findById(id: number): Promise<User | null> {
    const model = await UserModel.findByPk(id);

    return model ? UserMapper.toDomain(model) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const model = await UserModel.findOne({
      where: { email },
    });

    return model ? UserMapper.toDomain(model) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const model = await UserModel.findOne({
      where: { username },
    });

    return model ? UserMapper.toDomain(model) : null;
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const model = await UserModel.findByPk(id);

    if (!model) {
      throw new Error(`User ${id} not found`);
    }

    const currentUser = UserMapper.toDomain(model);

    await model.update(
      UserMapper.toPersistence({
        ...currentUser,
        ...data,
      }),
    );

    return UserMapper.toDomain(model);
  }

  async delete(id: number): Promise<void> {
    await UserModel.destroy({
      where: { id },
    });
  }
}

export const userRepositoryProvider = {
  provide: USER_REPOSITORY,
  useClass: SequelizeUserRepository,
};
