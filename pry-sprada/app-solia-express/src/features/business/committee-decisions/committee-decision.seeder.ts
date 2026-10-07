import { faker } from "@faker-js/faker";
import { CommitteeDecision } from "./committee-decision.model";
import { CreditApplication } from "../credit-applications/credit-application.model";

/**
 * Seeder del feature CommitteeDecision.
 * Se invoca desde SeedersRunner, no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 */
export async function seedCommitteeDecisions(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  committee_decisions: count=0, se omite");
    return 0;
  }

  const existing = await CommitteeDecision.count();

  if (existing > 0) {
    console.log(
      `⏭️  committee_decisions: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const creditApplications = await CreditApplication.findAll({
    attributes: ["id"],
  });

  if (creditApplications.length === 0) {
    console.log(
      "⏭️  committee_decisions: no existen credit applications, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, (_, index) => ({
    credit_application_id:
      creditApplications[index % creditApplications.length].id,
    decision: faker.helpers.arrayElement([
      "pending",
      "approved",
      "rejected",
      "observed",
    ]) as "pending" | "approved" | "rejected" | "observed",
    decision_date: faker.date.recent({ days: 30 }),
    comments: faker.lorem.sentence(),
    decided_by: null,
    status: "active" as const,
  }));

  await CommitteeDecision.bulkCreate(rows);

  console.log(
    `✅ committee_decisions: insertados ${count} registro(s) falsos`
  );

  return count;
}
