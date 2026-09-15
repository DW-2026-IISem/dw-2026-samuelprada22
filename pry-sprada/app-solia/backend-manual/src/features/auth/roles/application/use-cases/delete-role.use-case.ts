import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role-repository.interface.js';
import type { IRoleRepository } from '../../domain/interfaces/role-repository.interface.js';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception.js';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new RoleNotFoundException(id);
    }
    await this.roleRepository.delete(id);
  }
}
