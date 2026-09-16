import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { seedClients } from '../../../features/business/clients/infrastructure/persistence/seeders/clients.seeder.js';
import { seedProductTypes } from '../../../features/business/product-types/infrastructure/persistence/seeders/product-types.seeder.js';
import { seedProducts } from '../../../features/business/products/infrastructure/persistence/seeders/products.seeder.js';
import { seedSales } from '../../../features/business/sales/infrastructure/persistence/seeders/sales.seeder.js';

import { seedAuthBootstrap } from './auth-bootstrap.seeder.js';

/**
 * Ejecuta seeders en orden de dependencias:
 * Business → Auth (users/roles/resources → pivotes)
 */
@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      await seedClients();
      await seedProductTypes();
      await seedProducts();
      await seedSales();

      await seedAuthBootstrap();

      this.logger.log('✅ Seeders ejecutados correctamente');
    } catch (error) {
      this.logger.error('❌ Error ejecutando seeders', error);
      throw error;
    }
  }
}
