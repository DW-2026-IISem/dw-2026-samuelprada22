import { Inject, Injectable } from '@nestjs/common';
import { RoleNameExistsException } from '../../domain/exceptions/role-name-exists.exception';
import { RoleNotFoundException } from '../../domain/exceptions/role-not-found.exception';
import { ROLE_REPOSITORY } from '../../domain/interfaces/role-repository.interface';
import type { IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: number, dto: UpdateRoleDto) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new RoleNotFoundException(id);
    }

    if (dto.name && dto.name !== existing.name) {
      const nameTaken = await this.roleRepository.findByName(dto.name);
      if (nameTaken) {
        throw new RoleNameExistsException(dto.name);
      }
    }

    const updated = await this.roleRepository.update(id, dto);
    return RoleMapper.toResponse(updated);
  }
}
