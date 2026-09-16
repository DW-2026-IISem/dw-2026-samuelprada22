import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AssignRoleUserDto } from '../../../application/dto/assign-role-user.dto.js';
import { AssignRoleUserUseCase } from '../../../application/use-cases/assign-role-user.use-case.js';
import { ListRoleUsersByUserUseCase } from '../../../application/use-cases/list-role-users-by-user.use-case.js';
import { RevokeRoleUserUseCase } from '../../../application/use-cases/revoke-role-user.use-case.js';

@Controller('role-users')
export class RoleUsersController {
  constructor(
    private readonly assignRoleUserUseCase: AssignRoleUserUseCase,
    private readonly revokeRoleUserUseCase: RevokeRoleUserUseCase,
    private readonly listRoleUsersByUserUseCase: ListRoleUsersByUserUseCase,
  ) {}

  @Post()
  assign(@Body() dto: AssignRoleUserDto) {
    return this.assignRoleUserUseCase.execute(dto);
  }

  @Delete(':id')
  async revoke(@Param('id', ParseIntPipe) id: number) {
    await this.revokeRoleUserUseCase.execute(id);
    return { message: 'Asignación revocada' };
  }

  @Get('user/:userId')
  listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.listRoleUsersByUserUseCase.execute(userId);
  }
}
