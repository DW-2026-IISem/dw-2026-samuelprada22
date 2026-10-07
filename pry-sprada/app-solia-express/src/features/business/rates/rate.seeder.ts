import { faker } from "@faker-js/faker";
import { Rate } from "./rate.model";

/**
 * Seeder del feature Rate (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedRates(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  rates: count=0, se omite");
    return 0;
  }

  const existing = await Rate.count();
  if (existing > 0) {
    console.log(`⏭️  rates: ya hay ${existing} registro(s), se omite seeder`);
    return 0;
  }

  const rows = Array.from({ length: count }, () => ({
    name: `Tasa ${faker.finance.accountName()}`,
    percentage: Number(
      faker.number.float({
        min: 0.5,
        max: 5,
        fractionDigits: 2,
      }).toFixed(2)
    ),
    type: faker.helpers.arrayElement([
      "monthly",
      "annual",
    ]) as "monthly" | "annual",
    description: faker.commerce.productDescription(),
    status: "active" as const,
  }));

  await Rate.bulkCreate(rows);
  console.log(`✅ rates: insertados ${count} registro(s) falsos`);
  return count;
}
