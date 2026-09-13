import { Module } from '@nestjs/common';

import { MembersModule } from './members/members.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { MovementsModule } from './movements/movements.module.js';
import { CreditApplicationsModule } from './credit-applications/credit-applications.module.js';
import { CreditsModule } from './credits/credits.module.js';
import { InstallmentsModule } from './installments/installments.module.js';
import { InstallmentPaymentsModule } from './installment-payments/installment-payments.module.js';
import { RatesModule } from './rates/rates.module.js';

@Module({
  imports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
    CreditApplicationsModule,
    CreditsModule,
    InstallmentsModule,
    InstallmentPaymentsModule,
    RatesModule,
  ],
  exports: [
    MembersModule,
    AccountsModule,
    MovementsModule,
    CreditApplicationsModule,
    CreditsModule,
    InstallmentsModule,
    InstallmentPaymentsModule,
    RatesModule,
  ],
})
export class BusinessModule {}
