import { faker } from "@faker-js/faker";
import { Credit } from "./credit.model";

/**
 * Seeder del feature Credit (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedCredits(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  credits: count=0, se omite");
    return 0;
  }

  const existing = await Credit.count();

  if (existing > 0) {
    console.log(
      `⏭️  credits: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    credit_application_id: index + 1,
    rate_id: 1,
    date: faker.date.recent({ days: 30 }),
    approved_amount: faker.number.int({
      min: 1000000,
      max: 15000000,
    }),
    term: faker.number.int({
      min: 6,
      max: 60,
    }),
    interest_rate: faker.number.float({
      min: 0.5,
      max: 3.5,
      fractionDigits: 2,
    }),
    status: "active" as const,
    observations: faker.lorem.sentence(),
  }));

  await Credit.bulkCreate(rows);

  console.log(
    `✅ credits: insertados ${count} registro(s) falsos`
  );

  return count;
}
