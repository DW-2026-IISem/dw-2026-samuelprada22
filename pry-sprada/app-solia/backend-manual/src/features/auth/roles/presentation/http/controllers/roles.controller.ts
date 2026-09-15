import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateRoleDto } from '../../../application/dto/create-role.dto.js';
import { UpdateRoleDto } from '../../../application/dto/update-role.dto.js';
import { CreateRoleUseCase } from '../../../application/use-cases/create-role.use-case.js';
import { DeleteRoleUseCase } from '../../../application/use-cases/delete-role.use-case.js';
import { GetRoleUseCase } from '../../../application/use-cases/get-role.use-case.js';
import { ListRolesUseCase } from '../../../application/use-cases/list-roles.use-case.js';
import { UpdateRoleUseCase } from '../../../application/use-cases/update-role.use-case.js';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.listRolesUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getRoleUseCase.execute(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deleteRoleUseCase.execute(id);
    return { message: 'Rol eliminado' };
  }
}
