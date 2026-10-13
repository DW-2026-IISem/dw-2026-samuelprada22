import { Rate } from "./rate.model";
import { Credit } from "../credits/credit.model";

Rate.hasMany(Credit, {
  foreignKey: "rate_id",
  as: "credits",
});

Credit.belongsTo(Rate, {
  foreignKey: "rate_id",
  as: "rate",
});
