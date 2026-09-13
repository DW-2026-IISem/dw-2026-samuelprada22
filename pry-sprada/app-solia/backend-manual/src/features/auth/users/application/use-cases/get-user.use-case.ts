import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return UserMapper.toResponse(user);
  }
}
