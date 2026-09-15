import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { ResourcesModule } from './resources/resources.module.js';
import { ResourceRolesModule } from './resource-roles/resource-roles.module.js';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    ResourcesModule,
    ResourceRolesModule,
  ],
  exports: [
    UsersModule,
    RolesModule,
    ResourcesModule,
    ResourceRolesModule,
  ],
})
export class AuthModule {}
