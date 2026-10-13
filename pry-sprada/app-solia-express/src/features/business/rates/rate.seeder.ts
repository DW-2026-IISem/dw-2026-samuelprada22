import { faker } from "@faker-js/faker";
import { Rate } from "./rate.model";

export async function seedRates(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  rates: count=0, se omite");
    return 0;
  }

  const existing = await Rate.count();

  if (existing > 0) {
    console.log(
      `⏭️  rates: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const type: "monthly" | "annual" =
      index % 2 === 0 ? "monthly" : "annual";

    const percentage = Number(
      faker.number
        .float({
          min: 0.5,
          max: 5,
          fractionDigits: 2,
        })
        .toFixed(2)
    );

    return {
      name: `Tasa ${type === "monthly" ? "mensual" : "anual"} ${index + 1}`,
      percentage,
      type,
      description:
        type === "monthly"
          ? "Tasa mensual de prueba; porcentaje ilustrativo."
          : "Tasa anual de prueba; porcentaje ilustrativo.",
      status: "active" as const,
    };
  });

  await Rate.bulkCreate(rows);

  console.log(
    `✅ rates: insertados ${rows.length} registro(s) falsos`
  );

  return rows.length;
}
