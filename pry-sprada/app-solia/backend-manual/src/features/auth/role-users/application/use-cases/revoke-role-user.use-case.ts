import { Inject, Injectable } from '@nestjs/common';
import { ROLE_USER_REPOSITORY } from '../../domain/interfaces/role-user-repository.interface';
import type { IRoleUserRepository } from '../../domain/interfaces/role-user-repository.interface';
import { RoleUserNotFoundException } from '../../domain/exceptions/role-user-not-found.exception';
import { RoleUserModel } from '../../infrastructure/persistence/models/role-user.model';

@Injectable()
export class RevokeRoleUserUseCase {
  constructor(
    @Inject(ROLE_USER_REPOSITORY)
    private readonly roleUserRepository: IRoleUserRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await RoleUserModel.findByPk(id);
    if (!existing) {
      throw new RoleUserNotFoundException(id);
    }
    await this.roleUserRepository.revoke(id);
  }
}
