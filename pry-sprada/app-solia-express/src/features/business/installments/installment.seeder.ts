import { faker } from "@faker-js/faker";
import { Installment } from "./installment.model";
import { Credit } from "../credits/credit.model";

/**
 * Seeder del feature Installment (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 *
 * Requiere que existan créditos previamente creados,
 * ya que `installments.credit_id` es una FK hacia `credits.id`.
 */
export async function seedInstallments(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  installments: count=0, se omite");
    return 0;
  }

  const existing = await Installment.count();

  if (existing > 0) {
    console.log(
      `⏭️  installments: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const credits = await Credit.findAll({
    attributes: ["id"],
  });

  if (credits.length === 0) {
    console.log(
      "⏭️  installments: no existen créditos, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const credit = faker.helpers.arrayElement(credits);

    const principalAmount = Number(
      faker.number
        .float({
          min: 100000,
          max: 1000000,
          fractionDigits: 2,
        })
        .toFixed(2)
    );

    const interestAmount = Number(
      (
        principalAmount *
        faker.number.float({
          min: 0.01,
          max: 0.05,
          fractionDigits: 4,
        })
      ).toFixed(2)
    );

    const totalAmount = Number(
      (principalAmount + interestAmount).toFixed(2)
    );

    return {
      credit_id: credit.id,
      number: index + 1,
      due_date: faker.date.future({
        years: 1,
      }),
      principal_amount: principalAmount,
      interest_amount: interestAmount,
      total_amount: totalAmount,
      paid_amount: 0,
      status: "pending" as const,
    };
  });

  await Installment.bulkCreate(rows);

  console.log(
    `✅ installments: insertados ${count} registro(s) falsos`
  );

  return count;
}
