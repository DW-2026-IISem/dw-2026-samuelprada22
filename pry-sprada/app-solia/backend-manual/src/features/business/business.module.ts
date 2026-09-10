import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module.js';
import { AccountsModule } from './accounts/accounts.module.js';

@Module({
  imports: [MembersModule, AccountsModule],
  exports: [MembersModule, AccountsModule],
})
export class BusinessModule {}
