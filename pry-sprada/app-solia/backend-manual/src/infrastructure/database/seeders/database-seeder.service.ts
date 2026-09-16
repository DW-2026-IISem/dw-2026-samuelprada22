import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { seedMembers } from '../../../features/business/members/infrastructure/persistence/seeders/members.seeder.js';
import { seedAccounts } from '../../../features/business/accounts/infrastructure/persistence/seeders/accounts.seeder.js';
import { seedMovements } from '../../../features/business/movements/infrastructure/persistence/seeders/movements.seeder.js';
import { seedRates } from '../../../features/business/rates/infrastructure/persistence/seeders/rates.seeder.js';
import { seedCreditApplications } from '../../../features/business/credit-applications/infrastructure/persistence/seeders/credit-applications.seeder.js';
import { seedCredits } from '../../../features/business/credits/infrastructure/persistence/seeders/credits.seeder.js';
import { seedInstallments } from '../../../features/business/installments/infrastructure/persistence/seeders/installments.seeder.js';
import { seedInstallmentPayments } from '../../../features/business/installment-payments/infrastructure/persistence/seeders/installment-payments.seeder.js';
import { seedAuthBootstrap } from './auth-bootstrap.seeder.js';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      // ======================================================
      // BUSINESS
      // ======================================================

      await seedMembers();

      await seedAccounts();

      await seedRates();

      await seedCreditApplications();

      await seedCredits();

      await seedInstallments();

      await seedInstallmentPayments();

      await seedMovements();

      // ======================================================
      // AUTH
      // ======================================================

      await seedAuthBootstrap();

      this.logger.log('✅ Seeders ejecutados correctamente');
    } catch (error) {
      this.logger.error(
        '❌ Error ejecutando seeders',
        error,
      );

      throw error;
    }
  }
}
