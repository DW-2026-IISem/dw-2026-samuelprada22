import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthenticationModule } from './authentication/authentication.module.js';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module.js';
import { ResourceRolesModule } from './resource-roles/resource-roles.module.js';
import { ResourcesModule } from './resources/resources.module.js';
import { RoleUsersModule } from './role-users/role-users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    UsersModule,
    RolesModule,
    RoleUsersModule,
    ResourcesModule,
    ResourceRolesModule,
    RefreshTokensModule,
    AuthenticationModule,
  ],

  exports: [
    PassportModule,
    UsersModule,
    RolesModule,
    RoleUsersModule,
    ResourcesModule,
    ResourceRolesModule,
    RefreshTokensModule,
    AuthenticationModule,
  ],
})
export class AuthModule {}
