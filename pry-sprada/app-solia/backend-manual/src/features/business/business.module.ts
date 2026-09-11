import { Module } from '@nestjs/common';
import { MembersModule } from './members/members.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { MovementsModule } from './movements/movements.module.js';
import { CreditApplicationsModule } from './credit-applications/credit-applications.module.js';

@Module({
  imports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
    CreditApplicationsModule,
  ],
  exports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
    CreditApplicationsModule,
  ],
})
export class BusinessModule {}
