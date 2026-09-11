import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { MovementsModule } from './movements/movements.module.js';

@Module({
  imports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
  ],
  exports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
  ],
})
export class BusinessModule {}
