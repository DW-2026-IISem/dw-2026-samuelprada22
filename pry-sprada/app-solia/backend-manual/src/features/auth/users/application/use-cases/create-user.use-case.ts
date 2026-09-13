import { Inject, Injectable } from '@nestjs/common';
import { Status } from '../../../../../common/enums/status.enum.js';
import { PASSWORD_HASHER } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import type { IPasswordHasher } from '../../../../../infrastructure/security/hashing/password-hasher.interface.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserEmailExistsException } from '../../domain/exceptions/user-email-exists.exception.js';
import { UserUsernameExistsException } from '../../domain/exceptions/user-username-exists.exception.js';
import { USER_REPOSITORY } from '../../domain/interfaces/user-repository.interface.js';
import type { IUserRepository } from '../../domain/interfaces/user-repository.interface.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: CreateUserDto) {
    const existingEmail = await this.userRepository.findByEmail(dto.email);

    if (existingEmail) {
      throw new UserEmailExistsException(dto.email);
    }

    const existingUsername = await this.userRepository.findByUsername(
      dto.username,
    );

    if (existingUsername) {
      throw new UserUsernameExistsException(dto.username);
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const user = new User({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      isActive: dto.isActive ?? Status.ACTIVE,
      avatar: dto.avatar,
    });

    const created = await this.userRepository.create(user);

    return UserMapper.toResponse(created);
  }
}
