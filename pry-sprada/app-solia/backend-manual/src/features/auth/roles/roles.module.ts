import { Module } from '@nestjs/common';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case.js';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case.js';
import { GetRoleUseCase } from './application/use-cases/get-role.use-case.js';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case.js';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case.js';
import { roleRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-role.repository.js';
import { RolesController } from './presentation/http/controllers/roles.controller.js';

@Module({
  controllers: [RolesController],
  providers: [
    roleRepositoryProvider,
    CreateRoleUseCase,
    GetRoleUseCase,
    ListRolesUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
  ],
  exports: [roleRepositoryProvider],
})
export class RolesModule {}
