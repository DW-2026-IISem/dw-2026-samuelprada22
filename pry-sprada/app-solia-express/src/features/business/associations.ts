import { Member } from "./members/members.model";
import { Account } from "./account/account.model";

Member.hasMany(Account, {
  foreignKey: "member_id",
  as: "accounts",
});

Account.belongsTo(Member, {
  foreignKey: "member_id",
  as: "member",
});
