import { faker } from "@faker-js/faker";
import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";

/**
 * Seeder del feature CreditApplication.
 * Idempotente: si ya hay solicitudes de crédito, no inserta.
 */
export async function seedCreditApplications(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  credit_applications: count=0, se omite");
    return 0;
  }

  const existing = await CreditApplication.count();

  if (existing > 0) {
    console.log(
      `⏭️  credit_applications: ya hay ${existing} registro(s), se omite seeder`
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
      "⏭️  credit_applications: no hay socios activos, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const member =
      members[Math.floor(Math.random() * members.length)];

    return {
      member_id: member.id,
      reference_id: null,
      date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.finance.amount({
          min: 500000,
          max: 10000000,
          dec: 2,
        })
      ),
      status: faker.helpers.arrayElement([
        "pending",
        "approved",
        "rejected",
      ]) as "pending" | "approved" | "rejected",
      observations: faker.helpers.arrayElement([
        "Solicitud de crédito personal",
        "Solicitud de crédito para libre inversión",
        "Solicitud de crédito para educación",
        "Solicitud de crédito para vivienda",
        "Solicitud de crédito para emprendimiento",
      ]),
    };
  });

  await CreditApplication.bulkCreate(rows);

  console.log(
    `✅ credit_applications: insertados ${count} registro(s) falsos`
  );

  return count;
}
