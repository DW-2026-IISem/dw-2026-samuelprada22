import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [UsersModule],
  exports: [UsersModule],
})
export class AuthModule {}
