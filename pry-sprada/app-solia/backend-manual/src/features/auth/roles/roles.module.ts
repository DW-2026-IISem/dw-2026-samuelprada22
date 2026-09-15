import { Module } from '@nestjs/common';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';
import { GetRoleUseCase } from './application/use-cases/get-role.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { roleRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-role.repository';
import { RolesController } from './presentation/http/controllers/roles.controller';

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
