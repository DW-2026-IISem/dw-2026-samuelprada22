import { Credit } from "../credits/credit.model";
import { Installment } from "./installment.model";

Credit.hasMany(Installment, {
  foreignKey: "credit_id",
  as: "installments",
});

Installment.belongsTo(Credit, {
  foreignKey: "credit_id",
  as: "credit",
});
