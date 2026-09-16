import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { seedMembers } from '../../../features/business/members/infrastructure/persistence/seeders/members.seeder.js';
import { seedAccounts } from '../../../features/business/accounts/infrastructure/persistence/seeders/accounts.seeder.js';
import { seedMovements } from '../../../features/business/movements/infrastructure/persistence/seeders/movements.seeder.js';
import { seedCreditApplications } from '../../../features/business/credit-applications/infrastructure/persistence/seeders/credit-applications.seeder.js';
import { seedRates } from '../../../features/business/rates/infrastructure/persistence/seeders/rates.seeder.js';
import { seedCredits } from '../../../features/business/credits/infrastructure/persistence/seeders/credits.seeder.js';
import { seedInstallments } from '../../../features/business/installments/infrastructure/persistence/seeders/installments.seeder.js';
import { seedInstallmentPayments } from '../../../features/business/installment-payments/infrastructure/persistence/seeders/installment-payments.seeder.js';
import { seedAudits } from '../../../features/business/audits/infrastructure/persistence/seeders/audits.seeder.js';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    try {
      this.logger.log('🌱 Iniciando seeders de Business...');

      await seedMembers();
      this.logger.log('✅ Members');

      await seedAccounts();
      this.logger.log('✅ Accounts');

      await seedMovements();
      this.logger.log('✅ Movements');

      await seedCreditApplications();
      this.logger.log('✅ Credit Applications');

      await seedRates();
      this.logger.log('✅ Rates');

      await seedCredits();
      this.logger.log('✅ Credits');

      await seedInstallments();
      this.logger.log('✅ Installments');

      await seedInstallmentPayments();
      this.logger.log('✅ Installment Payments');

      await seedAudits();
      this.logger.log('✅ Audits');

      this.logger.log('🌱 Seeders de Business completados.');
    } catch (error) {
      this.logger.error('❌ Error ejecutando los seeders de Business', error);
      throw error;
    }
  }
}
