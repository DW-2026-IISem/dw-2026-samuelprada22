import { Member } from "../features/business/members/members.model";
import { Account } from "../features/business/account/account.model";
import { Movement } from "../features/business/movements/movement.model";

Member.hasMany(Account, {
  foreignKey: "member_id",
  as: "accounts",
});

Account.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});

Account.hasMany(Movement, {
  foreignKey: "account_id",
  as: "movements",
});

Movement.belongsTo(Account, {
  foreignKey: "account_id",
  as: "account",
});
