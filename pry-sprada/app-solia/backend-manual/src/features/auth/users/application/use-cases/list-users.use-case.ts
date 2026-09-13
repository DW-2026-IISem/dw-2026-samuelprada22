import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute() {
    const users = await this.userRepository.findAll();

    return users.map(UserMapper.toResponse);
  }
}
