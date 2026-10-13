import { faker } from "@faker-js/faker";
import { CommitteeDecision } from "./committee-decision.model";
import { CreditApplication } from "../credit-applications/credit-application.model";

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

  const applications = await CreditApplication.findAll({
    attributes: ["id", "status"],
  });

  if (applications.length === 0) {
    console.log(
      "⏭️  committee_decisions: no existen solicitudes, se omite seeder"
    );
    return 0;
  }

  const rows = applications
    .slice(0, count)
    .map((application) => {
      const status = application.status;

      const decision =
        status === "approved"
          ? "approved"
          : status === "rejected"
            ? "rejected"
            : status === "cancelled"
              ? "observed"
              : "pending";

      return {
        credit_application_id: application.id,
        decision: decision as
          | "pending"
          | "approved"
          | "rejected"
          | "observed",
        decision_date:
          decision === "pending"
            ? null
            : faker.date.recent({ days: 30 }),
        comments: faker.lorem.sentence(),
        decided_by: null,
        status: "active" as const,
      };
    });

  await CommitteeDecision.bulkCreate(rows);

  console.log(
    `✅ committee_decisions: insertados ${rows.length} registro(s) falsos`
  );

  return rows.length;
}
