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
import { CreateUserDto } from '../../../application/dto/create-user.dto.js';
import { UpdateUserDto } from '../../../application/dto/update-user.dto.js';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case.js';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case.js';
import { GetUserUseCase } from '../../../application/use-cases/get-user.use-case.js';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case.js';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getUserUseCase.execute(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deleteUserUseCase.execute(id);

    return {
      message: 'Usuario eliminado',
    };
  }
}
