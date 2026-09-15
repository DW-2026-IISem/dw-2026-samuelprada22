import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { seedMembers } from '../../../features/business/members/infrastructure/persistence/seeders/members.seeder.js';
import { seedAccounts } from '../../../features/business/accounts/infrastructure/persistence/seeders/accounts.seeder.js';
import { seedMovements } from '../../../features/business/movements/infrastructure/persistence/seeders/movements.seeder.js';
import { seedCreditApplications } from '../../../features/business/credit-applications/infrastructure/persistence/seeders/credit-applications.seeder.js';
import { seedAudits } from '../../../features/business/audits/infrastructure/persistence/seeders/audits.seeder.js';
import { seedCredits } from '../../../features/business/credits/infrastructure/persistence/seeders/credits.seeder.js';
import { seedInstallments } from '../../../features/business/installments/infrastructure/persistence/seeders/installments.seeder.js';
import { seedInstallmentPayments } from '../../../features/business/installment-payments/infrastructure/persistence/seeders/installment-payments.seeder.js';
import { seedRates } from '../../../features/business/rates/infrastructure/persistence/seeders/rates.seeder.js';

/**
 * Ejecuta los seeders en orden de dependencias.
 * Solo se ejecuta en entornos no productivos.
 */
@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(
    DatabaseSeederService.name,
  );

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      await seedMembers();
      await seedAccounts();
      await seedMovements();
      await seedCreditApplications();
      await seedAudits();
      await seedCredits();
      await seedInstallments();
      await seedInstallmentPayments();
      await seedRates();

      this.logger.log('✅ Seeders ejecutados');
    } catch (error: any) {
      this.logger.error(
        `❌ Error en seeders: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
