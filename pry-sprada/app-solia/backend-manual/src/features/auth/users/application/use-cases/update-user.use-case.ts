import { Inject, Injectable } from '@nestjs/common';
import { PASSWORD_HASHER } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import type { IPasswordHasher } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import { UserEmailExistsException } from '../../domain/exceptions/user-email-exists.exception.js';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception.js';
import { UserUsernameExistsException } from '../../domain/exceptions/user-username-exists.exception.js';
import { USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(id: number, dto: UpdateUserDto) {
    const existing = await this.userRepository.findById(id);

    if (!existing) {
      throw new UserNotFoundException(id);
    }

    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);

      if (emailTaken) {
        throw new UserEmailExistsException(dto.email);
      }
    }

    if (dto.username && dto.username !== existing.username) {
      const usernameTaken =
        await this.userRepository.findByUsername(dto.username);

      if (usernameTaken) {
        throw new UserUsernameExistsException(dto.username);
      }
    }

    const updateData: Partial<typeof existing> = {
      ...dto,
    };

    if (dto.password) {
      updateData.password = await this.passwordHasher.hash(dto.password);
    }

    const updated = await this.userRepository.update(id, updateData);

    return UserMapper.toResponse(updated);
  }
}
