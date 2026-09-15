import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [
    UsersModule,
    RolesModule,
  ],
  exports: [
    UsersModule,
    RolesModule,
  ],
})
export class AuthModule {}
