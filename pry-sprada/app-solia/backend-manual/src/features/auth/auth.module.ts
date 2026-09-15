import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RoleUsersModule } from './role-users/role-users.module';

@Module({
  imports: [UsersModule, RolesModule, RoleUsersModule],
  exports: [UsersModule, RolesModule, RoleUsersModule],
})
export class AuthModule {}
