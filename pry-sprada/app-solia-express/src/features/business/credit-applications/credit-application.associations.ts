import { CreditApplication } from "./credit-application.model";
import { Member } from "../members/members.model";
import { Credit } from "../credits/credit.model";

Member.hasMany(CreditApplication, {
  foreignKey: "member_id",
  as: "creditApplications",
});

CreditApplication.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});

CreditApplication.hasOne(Credit, {
  foreignKey: "credit_application_id",
  as: "credit",
});

Credit.belongsTo(CreditApplication, {
  foreignKey: "credit_application_id",
  as: "creditApplication",
});
