import { faker } from "@faker-js/faker";
import { Audit } from "./audit.model";

/**
 * Seeder del feature Audit (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedAudits(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  audits: count=0, se omite");
    return 0;
  }

  const existing = await Audit.count();

  if (existing > 0) {
    console.log(
      `⏭️  audits: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const actions = ["CREATE", "APPROVE", "REJECT", "UPDATE", "REVERSE"];
  const entities = [
    "CreditApplication",
    "Credit",
    "Movement",
    "Payment",
  ];

  const rows = Array.from({ length: count }, () => ({
    actor_user_id: faker.number.int({ min: 1, max: 5 }),
    action: faker.helpers.arrayElement(actions),
    entity: faker.helpers.arrayElement(entities),
    entity_id: faker.number.int({ min: 1, max: 10 }),
    data: JSON.stringify({
      message: faker.lorem.sentence(),
      source: "seed",
    }),
  }));

  await Audit.bulkCreate(rows);

  console.log(`✅ audits: insertados ${count} registro(s) falsos`);
  return count;
}
