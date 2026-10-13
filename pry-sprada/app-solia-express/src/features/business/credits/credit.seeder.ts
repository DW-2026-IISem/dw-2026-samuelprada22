import { faker } from "@faker-js/faker";
import { Credit } from "./credit.model";
import { CreditApplication } from "../credit-applications/credit-application.model";
import { Rate } from "../rates/rate.model";

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

  const [applications, rates] = await Promise.all([
    CreditApplication.findAll({
      where: { status: "approved" },
      attributes: ["id", "amount"],
    }),
    Rate.findAll({
      where: { status: "active" },
      attributes: ["id", "percentage"],
    }),
  ]);

  if (applications.length === 0) {
    console.log(
      "⏭️  credits: no hay solicitudes aprobadas, se omite seeder"
    );
    return 0;
  }

  if (rates.length === 0) {
    console.log(
      "⏭️  credits: no hay tasas activas, se omite seeder"
    );
    return 0;
  }

  const applicationsWithCredit = await Credit.findAll({
    attributes: ["credit_application_id"],
  });

  const usedApplicationIds = new Set(
    applicationsWithCredit.map(
      (credit) => credit.credit_application_id
    )
  );

  const availableApplications = applications.filter(
    (application) => !usedApplicationIds.has(application.id)
  );

  if (availableApplications.length === 0) {
    console.log(
      "⏭️  credits: todas las solicitudes aprobadas ya tienen crédito"
    );
    return 0;
  }

  const rows = availableApplications
    .slice(0, count)
    .map((application) => {
      const rate = faker.helpers.arrayElement(rates);

      return {
        credit_application_id: application.id,
        rate_id: rate.id,
        date: faker.date.recent({ days: 30 }),
        approved_amount: Number(application.amount),
        term: faker.number.int({ min: 6, max: 60 }),
        interest_rate: Number(rate.percentage),
        status: "active" as const,
        observations: faker.lorem.sentence(),
      };
    });

  await Credit.bulkCreate(rows);

  console.log(
    `✅ credits: insertados ${rows.length} registro(s) falsos`
  );

  return rows.length;
}
