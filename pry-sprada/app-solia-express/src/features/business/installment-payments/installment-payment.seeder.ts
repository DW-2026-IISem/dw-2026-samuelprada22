import { faker } from "@faker-js/faker";
import { InstallmentPayment } from "./installment-payment.model";
import { Installment } from "../installments/installment.model";

/**
 * Seeder del feature InstallmentPayment (datos falsos con @faker-js/faker).
 * Se invoca desde `src/database/seeders` (SeedersRunner), no desde la App.
 *
 * Idempotente: si ya hay filas, no vuelve a insertar.
 *
 * Requiere que existan cuotas previamente creadas,
 * ya que `installment_payments.installment_id` es una FK hacia `installments.id`.
 */
export async function seedInstallmentPayments(
  count: number
): Promise<number> {
  if (count <= 0) {
    console.log("⏭️  installment_payments: count=0, se omite");
    return 0;
  }

  const existing = await InstallmentPayment.count();

  if (existing > 0) {
    console.log(
      `⏭️  installment_payments: ya hay ${existing} registro(s), se omite seeder`
    );
    return 0;
  }

  const installments = await Installment.findAll({
    attributes: ["id"],
  });

  if (installments.length === 0) {
    console.log(
      "⏭️  installment_payments: no existen cuotas, se omite seeder"
    );
    return 0;
  }

  const rows = Array.from({ length: count }, () => {
    const installment = faker.helpers.arrayElement(installments);

    return {
      installment_id: installment.id,
      payment_date: faker.date.recent({ days: 30 }),
      amount: Number(
        faker.number
          .float({
            min: 50000,
            max: 1000000,
            fractionDigits: 2,
          })
          .toFixed(2)
      ),
      reference: `PAGO-${faker.string.alphanumeric(8).toUpperCase()}`,
      method: faker.helpers.arrayElement([
        "cash",
        "transfer",
        "deposit",
        "other",
      ]) as "cash" | "transfer" | "deposit" | "other",
      status: "active" as const,
    };
  });

  await InstallmentPayment.bulkCreate(rows);

  console.log(
    `✅ installment_payments: insertados ${count} registro(s) falsos`
  );

  return count;
}
