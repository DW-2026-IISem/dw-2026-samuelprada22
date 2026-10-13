import { faker } from "@faker-js/faker";
import { InstallmentPayment } from "./installment-payment.model";
import { Installment } from "../installments/installment.model";
import { sequelize } from "../../../database/db";

export async function seedInstallmentPayments(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  installment_payments: count=0, se omite");
    return 0;
  }

  if ((await InstallmentPayment.count()) > 0) {
    console.log(
      "⏭️  installment_payments: ya existen pagos, se omite seeder"
    );
    return 0;
  }

  const installments = await Installment.findAll({
    where: {
      status: ["pending", "overdue"],
    },
    attributes: [
      "id",
      "total_amount",
      "paid_amount",
      "status",
    ],
  });

  const balances = new Map<number, number>();
  const paidAmounts = new Map<number, number>();
  const rows: Array<{
    installment_id: number;
    payment_date: Date;
    amount: number;
    reference: string;
    method: "cash" | "transfer" | "deposit" | "other";
    status: "active";
  }> = [];

  for (const installment of installments) {
    const balance = Number(installment.total_amount) -
      Number(installment.paid_amount);

    if (Number.isFinite(balance) && balance > 0) {
      balances.set(installment.id, balance);
      paidAmounts.set(
        installment.id,
        Number(installment.paid_amount)
      );
    }
  }

  if (balances.size === 0) {
    console.log(
      "⏭️  installment_payments: no hay saldos pendientes"
    );
    return 0;
  }

  const eligible = installments.filter(
    (installment) => balances.has(installment.id)
  );

  for (let index = 0; index < count; index++) {
    const installment = eligible[index % eligible.length];
    const installmentId = installment.id;
    const balance = balances.get(installmentId) ?? 0;

    if (balance <= 0) {
      continue;
    }

    const maxAmount = Math.min(balance, 1000000);
    const amount = Number(
      faker.number
        .float({
          min: Math.min(0.01, maxAmount),
          max: maxAmount,
          fractionDigits: 2,
        })
        .toFixed(2)
    );

    if (amount <= 0 || amount > balance) {
      continue;
    }

    rows.push({
      installment_id: installmentId,
      payment_date: faker.date.recent({ days: 30 }),
      amount,
      reference: `PAGO-${faker.string.alphanumeric(8).toUpperCase()}`,
      method: faker.helpers.arrayElement([
        "cash",
        "transfer",
        "deposit",
        "other",
      ]),
      status: "active",
    });

    balances.set(
      installmentId,
      Number((balance - amount).toFixed(2))
    );

    paidAmounts.set(
      installmentId,
      Number(
        ((paidAmounts.get(installmentId) ?? 0) + amount).toFixed(2)
      )
    );
  }

  if (rows.length === 0) {
    console.log("⏭️  installment_payments: no hay pagos válidos");
    return 0;
  }

  await sequelize.transaction(async (transaction) => {
    await InstallmentPayment.bulkCreate(rows, { transaction });

    for (const installment of eligible) {
      const installmentId = installment.id;

      if (!paidAmounts.has(installmentId)) {
        continue;
      }

      const paidAmount = paidAmounts.get(installmentId)!;
      const totalAmount = Number(installment.total_amount);

      await installment.update(
        {
          paid_amount: paidAmount,
          status:
            paidAmount >= totalAmount
              ? "paid"
              : installment.status,
        },
        { transaction }
      );
    }
  });

  console.log(
    `✅ installment_payments: insertados ${rows.length} pago(s)`
  );

  return rows.length;
}
