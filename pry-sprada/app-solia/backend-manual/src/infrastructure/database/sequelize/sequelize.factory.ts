import { Sequelize } from 'sequelize-typescript';
import { DatabaseDialect } from '../../../config/environment/env.interface.js';
import { getSequelizeOptions } from './sequelize.options.js';

import mysql2 from 'mysql2';
import pg from 'pg';
import tedious from 'tedious';
import oracledb from 'oracledb';

import { MemberModel } from '../../../features/business/members/infrastructure/persistence/models/member.model.js';
import { AccountModel } from '../../../features/business/accounts/infrastructure/persistence/models/account.model.js';
import { MovementModel } from '../../../features/business/movements/infrastructure/persistence/models/movement.model.js';
import { CreditApplicationModel } from '../../../features/business/credit-applications/infrastructure/persistence/models/credit-application.model.js';
import { CreditModel } from '../../../features/business/credits/infrastructure/persistence/models/credit.model.js';
import { InstallmentModel } from '../../../features/business/installments/infrastructure/persistence/models/installment.model.js';

export const ALL_MODELS = [
  MemberModel,
  AccountModel,
  MovementModel,
  CreditApplicationModel,
  CreditModel,
  InstallmentModel,
];

export async function createSequelizeInstance(
  dialect: DatabaseDialect,
): Promise<Sequelize> {
  const options = getSequelizeOptions(dialect);

  let dialectModule: any;

  switch (dialect) {
    case DatabaseDialect.MySQL:
      dialectModule = mysql2;
      break;
    case DatabaseDialect.Postgres:
      dialectModule = pg;
      break;
    case DatabaseDialect.MSSQL:
      dialectModule = tedious;
      break;
    case DatabaseDialect.Oracle:
      dialectModule = oracledb;
      break;
    default:
      throw new Error(`Dialecto no soportado: ${dialect}`);
  }

  const sequelize = new Sequelize({
    ...options,
    dialectModule,
    models: ALL_MODELS,
  } as any);

  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión exitosa a ${dialect.toUpperCase()}`);
  } catch (error: any) {
    console.error(
      `❌ Error conectando a ${dialect.toUpperCase()}:`,
      error.message,
    );
    throw error;
  }

  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: false });
    console.log('✅ Tablas sincronizadas');
  }

  return sequelize;
}
