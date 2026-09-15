import { Module } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AssignRoleUserUseCase } from './application/use-cases/assign-role-user.use-case';
import { ListRoleUsersByUserUseCase } from './application/use-cases/list-role-users-by-user.use-case';
import { RevokeRoleUserUseCase } from './application/use-cases/revoke-role-user.use-case';
import { roleUserRepositoryProvider } from './infrastructure/persistence/repositories/sequelize-role-user.repository';
import { RoleUsersController } from './presentation/http/controllers/role-users.controller';

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
