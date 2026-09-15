import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { ResourcesModule } from './resources/resources.module.js';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    ResourcesModule,
  ],
  exports: [
    UsersModule,
    RolesModule,
    ResourcesModule,
  ],
})
export class AuthModule {}
