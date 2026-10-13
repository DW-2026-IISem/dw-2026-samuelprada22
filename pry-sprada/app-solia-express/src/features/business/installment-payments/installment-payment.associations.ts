import { Installment } from "../installments/installment.model";
import { InstallmentPayment } from "./installment-payment.model";

Installment.hasMany(InstallmentPayment, {
  foreignKey: "installment_id",
  as: "payments",
});

InstallmentPayment.belongsTo(Installment, {
  foreignKey: "installment_id",
  as: "installment",
});
