import { CreditApplication } from "../credit-applications/credit-application.model";
import { CommitteeDecision } from "./committee-decision.model";

CreditApplication.hasMany(CommitteeDecision, {
  foreignKey: "credit_application_id",
  as: "committee_decisions",
});

CommitteeDecision.belongsTo(CreditApplication, {
  foreignKey: "credit_application_id",
  as: "credit_application",
});
