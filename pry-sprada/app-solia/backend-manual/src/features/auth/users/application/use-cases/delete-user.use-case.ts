import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception.js';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new UserNotFoundException(id);
    }

    await this.userRepository.delete(id);
  }
}
