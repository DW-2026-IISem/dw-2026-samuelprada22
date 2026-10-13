import dotenv from "dotenv";
import { sequelize, testConnection } from "../db";

import "../../features/business/members/members.model";
import "../../features/business/account/account.model";
import "../../features/business/movements/movement.model";
import "../../features/business/credit-applications/credit-application.model";
import "../../features/business/credits/credit.model";
import "../../features/business/rates/rate.model";
import "../../features/business/installments/installment.model";
import "../../features/business/installment-payments/installment-payment.model";
import "../../features/business/committee-decisions/committee-decision.model";
import "../../features/business/audit/audit.model";

import "../../features/auth/users/user.model";
import "../../features/auth/roles/role.model";
import "../../features/auth/resources/resource.model";
import "../../features/auth/role-users/role-user.model";
import "../../features/auth/resource-roles/resource-role.model";
import "../../features/auth/refresh-tokens/refresh-token.model";
import "../../features/auth/rbac.associations";

import "../../features/business/credit-applications/credit-application.associations";

import { seedMembers } from "../../features/business/members/members.seeder";
import { seedAccounts } from "../../features/business/account/account.seeder";
import { seedMovements } from "../../features/business/movements/movement.seeder";
import { seedRates } from "../../features/business/rates/rate.seeder";
import { seedCreditApplications } from "../../features/business/credit-applications/credit-application.seeder";
import { seedCredits } from "../../features/business/credits/credit.seeder";
import { seedInstallments } from "../../features/business/installments/installment.seeder";
import { seedInstallmentPayments } from "../../features/business/installment-payments/installment-payment.seeder";
import { seedCommitteeDecisions } from "../../features/business/committee-decisions/committee-decision.seeder";
import { seedAudits } from "../../features/business/audit/audit.seeder";
import { seedUsers } from "../../features/auth/users/users.seeder";
import { seedRoles } from "../../features/auth/roles/roles.seeder";
import { seedResources } from "../../features/auth/resources/resources.seeder";
import { seedRoleUsers } from "../../features/auth/role-users/role-users.seeder";
import { seedResourceRoles } from "../../features/auth/resource-roles/resource-roles.seeder";

import { resolveSeedCounts } from "./counts";

dotenv.config();

/**
 * SeedersRunner — ejecuta los seeders de todas las tablas de FondoSolidario.
 *
 * Orden general:
 * members → accounts → movements
 * rates → credit_applications → credits
 * credits → installments → installment_payments
 * credit_applications → committee_decisions
 * audits
 *
 * Cada seeder es idempotente.
 */
export async function runAllSeeders(): Promise<void> {
  const counts = resolveSeedCounts();

  console.log("🌱 Iniciando SeedersRunner...");
  console.log("📊 Conteos:", counts);

  const ok = await testConnection();

  if (!ok) {
    throw new Error("No hay conexión a la base de datos");
  }

  const isMysql =
    sequelize.getDialect() === "mysql" ||
    sequelize.getDialect() === "mariadb";

  if (isMysql) {
    await sequelize.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    );
  }

  try {
    await sequelize.sync({
      force: false,
      alter: true,
    });
  } finally {
    if (isMysql) {
      await sequelize.query(
        "SET FOREIGN_KEY_CHECKS = 1"
      );
    }
  }

  // Orden: business (padres → hijos)

  await seedMembers(counts.members);

  await seedAccounts(counts.accounts);

  await seedMovements(counts.movements);

  await seedRates(counts.rates);

  await seedCreditApplications(
    counts.credit_applications
  );

  await seedCredits(counts.credits);

  await seedInstallments(
    counts.installments
  );

  await seedInstallmentPayments(
    counts.installment_payments
  );

  await seedCommitteeDecisions(
    counts.committee_decisions
  );

  await seedAudits(counts.audits);

  // Seguridad / RBAC
  await seedUsers(2);
  await seedRoles();
  await seedResources();
  await seedRoleUsers();
  await seedResourceRoles();

  console.log(
    "🌱 SeedersRunner finalizado"
  );
}

if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(
        "❌ Error en seeders:",
        err
      );

      await sequelize.close();
      process.exit(1);
    });
}
