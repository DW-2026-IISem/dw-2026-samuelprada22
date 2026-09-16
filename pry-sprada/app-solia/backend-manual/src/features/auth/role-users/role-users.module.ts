import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module.js';
import { UsersModule } from '../users/users.module.js';
import { AssignRoleUserUseCase } from './application/use-cases/assign-role-user.use-case.js';
import { ListRoleUsersByUserUseCase } from './application/use-cases/list-role-users-by-user.use-case.js';
import { RevokeRoleUserUseCase } from './application/use-cases/revoke-role-user.use-case.js';
import { roleUserRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-role-user.repository.js';
import { RoleUsersController } from './presentation/http/controllers/role-users.controller.js';

@Module({
  imports: [UsersModule, RolesModule],
  controllers: [RoleUsersController],
  providers: [
    roleUserRepositoryProvider,
    AssignRoleUserUseCase,
    RevokeRoleUserUseCase,
    ListRoleUsersByUserUseCase,
  ],
  exports: [roleUserRepositoryProvider],
})
export class RoleUsersModule {}
