import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { AssignResourceRoleDto } from '../../../application/dto/assign-resource-role.dto.js';

import { AssignResourceRoleUseCase } from '../../../application/use-cases/assign-resource-role.use-case.js';
import { ListResourceRolesUseCase } from '../../../application/use-cases/list-resource-roles.use-case.js';
import { RevokeResourceRoleUseCase } from '../../../application/use-cases/revoke-resource-role.use-case.js';

@Controller('resource-roles')
export class ResourceRolesController {
  constructor(
    private readonly assignResourceRoleUseCase: AssignResourceRoleUseCase,
    private readonly revokeResourceRoleUseCase: RevokeResourceRoleUseCase,
    private readonly listResourceRolesUseCase: ListResourceRolesUseCase,
  ) {}

  @Post()
  assign(@Body() dto: AssignResourceRoleDto) {
    return this.assignResourceRoleUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.listResourceRolesUseCase.execute();
  }

  @Delete(':id')
  async revoke(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.revokeResourceRoleUseCase.execute(id);

    return {
      message: 'Permiso revocado',
    };
  }
}
