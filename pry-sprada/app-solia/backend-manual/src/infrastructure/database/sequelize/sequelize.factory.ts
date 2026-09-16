import { Sequelize } from 'sequelize-typescript';

import mysql2 from 'mysql2';
import pg from 'pg';
import tedious from 'tedious';
import oracledb from 'oracledb';

import { DatabaseDialect } from '../../../config/environment/env.interface.js';
import { getSequelizeOptions } from './sequelize.options.js';

import { MemberModel } from '../../../features/business/members/infrastructure/persistence/models/member.model.js';
import { AccountModel } from '../../../features/business/accounts/infrastructure/persistence/models/account.model.js';
import { MovementModel } from '../../../features/business/movements/infrastructure/persistence/models/movement.model.js';
import { CreditApplicationModel } from '../../../features/business/credit-applications/infrastructure/persistence/models/credit-application.model.js';
import { CreditModel } from '../../../features/business/credits/infrastructure/persistence/models/credit.model.js';
import { InstallmentModel } from '../../../features/business/installments/infrastructure/persistence/models/installment.model.js';
import { InstallmentPaymentModel } from '../../../features/business/installment-payments/infrastructure/persistence/models/installment-payment.model.js';
import { RateModel } from '../../../features/business/rates/infrastructure/persistence/models/rate.model.js';
import { DecisionCommitteeModel } from '../../../features/business/decision-committees/infrastructure/persistence/models/decision-committee.model.js';
import { AuditModel } from '../../../features/business/audits/infrastructure/persistence/models/audit.model.js';

import { UserModel } from '../../../features/auth/users/infrastructure/persistence/models/user.model.js';
import { RoleModel } from '../../../features/auth/roles/infrastructure/persistence/models/role.model.js';
import { ResourceModel } from '../../../features/auth/resources/infrastructure/persistence/models/resource.model.js';
import { ResourceRoleModel } from '../../../features/auth/resource-roles/infrastructure/persistence/models/resource-role.model.js';
import { RefreshTokenModel } from '../../../features/auth/refresh-tokens/infrastructure/persistence/models/refresh-token.model.js';

export const ALL_MODELS = [
  MemberModel,
  AccountModel,
  MovementModel,
  CreditApplicationModel,
  CreditModel,
  InstallmentModel,
  InstallmentPaymentModel,
  RateModel,
  DecisionCommitteeModel,
  AuditModel,

  UserModel,
  RoleModel,
  ResourceModel,
  ResourceRoleModel,
  RefreshTokenModel,
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
