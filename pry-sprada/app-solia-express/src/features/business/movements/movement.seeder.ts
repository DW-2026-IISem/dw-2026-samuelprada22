import { faker } from "@faker-js/faker";
import { Movement } from "./movement.model";
import { Account } from "../account/account.model";

/**
 * Movement feature seeder.
 *
 * Generates movements associated with active accounts.
 *
 * It is executed from `src/database/seeders` (SeedersRunner),
 * not from the App.
 *
 * Idempotent: if movements already exist,
 * no new records are inserted.
 */
export async function seedMovements(count: number): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  movements: count=0, skipped");
    return 0;
  }

  const existing = await Movement.count();

  if (existing > 0) {
    console.log(
      `⏭️  movements: ${existing} record(s) already exist, seeder skipped`
    );
    return 0;
  }

  const accounts = await Account.findAll({
    where: {
      status: "active",
    },
  });

  if (accounts.length === 0) {
    console.log(
      "⏭️  movements: no active accounts found, seeder skipped"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const account =
      accounts[Math.floor(Math.random() * accounts.length)];

    const type = faker.helpers.arrayElement([
      "credit",
      "debit",
    ]);

    return {
      account_id: account.id,
      reference_id: null,
      type,
      date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.finance.amount({
          min: 10000,
          max: 1000000,
          dec: 2,
        })
      ),
      observations: faker.helpers.arrayElement([
        "Monthly contribution",
        "Account deposit",
        "Funds withdrawal",
        "Savings movement",
        "Registered payment",
        "Internal transfer",
      ]),
      status: "active" as const,
    };
  });

  await Movement.bulkCreate(rows);

  console.log(
    `✅ movements: ${count} fake record(s) inserted`
  );

  return count;
}
