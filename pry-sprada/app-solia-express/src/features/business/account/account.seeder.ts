import { faker } from "@faker-js/faker";
import { Account } from "./account.model";
import { Member } from "../members/members.model";

/**
 * Seeder del feature Account.
 *
 * Genera cuentas asociadas a miembros activos.
 *
 * Se invoca desde src/database/seeders (SeedersRunner),
 * no desde la App.
 *
 * Es idempotente:
 * si ya existen registros en la tabla accounts,
 * no vuelve a insertar datos.
 */
export async function seedAccounts(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  accounts: count=0, se omite");
    return 0;
  }

  const existing = await Account.count();

  if (existing > 0) {
    console.log(
      `⏭️  accounts: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const members = await Member.findAll({
    where: {
      isActive: true,
    },
  });

  if (members.length === 0) {
    console.log(
      "⏭️  accounts: no hay miembros activos, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const member =
      members[Math.floor(Math.random() * members.length)];

    return {
      member_id: member.id,
      name: faker.finance.accountName(),
      description: faker.lorem.sentence(),
      status: "active" as const,
    };
  });

  await Account.bulkCreate(rows);

  console.log(
    `✅ accounts: insertados ${count} registro(s) falsos`
  );

  return count;
}
