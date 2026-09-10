import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module.js';

@Module({
  imports: [MembersModule],
  exports: [MembersModule],
})
export class BusinessModule {}
