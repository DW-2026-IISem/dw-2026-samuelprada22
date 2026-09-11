import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { seedMembers } from '../../../features/business/members/infrastructure/persistence/seeders/members.seeder.js';
import { seedAccounts } from '../../../features/business/accounts/infrastructure/persistence/seeders/accounts.seeder.js';
import { seedMovements } from '../../../features/business/movements/infrastructure/persistence/seeders/movements.seeder.js';

/**
 * Ejecuta seeders en orden de dependencias.
 * Solo en entornos no productivos.
 */
@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      await seedMembers();
      await seedAccounts();
      await seedMovements();

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
