import { Transaction } from "sequelize";
import { sequelize } from "../../../database/db";
import { Installment } from "../installments/installment.model";
import { InstallmentPayment } from "./installment-payment.model";

type PaymentMethod = "cash" | "transfer" | "deposit" | "other";

interface PaymentInput {
  installment_id?: number;
  payment_date?: Date | string;
  amount?: number | string;
  reference?: string | null;
  method?: PaymentMethod;
}

export class InstallmentPaymentError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "InstallmentPaymentError";
  }
}

function toCents(value: number | string): number {
  const normalized = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new InstallmentPaymentError(
      "The amount must be a valid positive value with up to two decimal places",
      400
    );
  }

  const [whole, decimal = ""] = normalized.split(".");
  const cents = Number(whole) * 100 +
    Number(decimal.padEnd(2, "0"));

  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new InstallmentPaymentError(
      "The payment amount must be greater than zero",
      400
    );
  }

  return cents;
}

function dateKey(value: Date | string): string {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
      return match[1];
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new InstallmentPaymentError(
      "Invalid installment due date",
      500
    );
  }

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function todayInColombia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function lockInstallments(
  ids: number[],
  transaction: Transaction
): Promise<Map<number, Installment>> {
  const installments = new Map<number, Installment>();

  for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
    const installment = await Installment.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!installment) {
      throw new InstallmentPaymentError(
        `Installment ${id} not found`,
        404
      );
    }

    installments.set(id, installment);
  }

  return installments;
}

async function getActivePaidCents(
  installmentId: number,
  transaction: Transaction,
  excludedPaymentId?: number
): Promise<number> {
  const payments = await InstallmentPayment.findAll({
    where: {
      installment_id: installmentId,
      status: "active",
    },
    attributes: ["id", "amount"],
    transaction,
  });

  return payments.reduce((total, payment) => {
    if (payment.id === excludedPaymentId) {
      return total;
    }

    return total + toCents(String(payment.amount));
  }, 0);
}

async function reconcileInstallment(
  installment: Installment,
  transaction: Transaction
): Promise<void> {
  const paidCents = await getActivePaidCents(
    installment.id,
    transaction
  );

  const totalCents = toCents(String(installment.total_amount));

  let status: Installment["status"];

  if (installment.status === "cancelled") {
    status = "cancelled";
  } else if (paidCents >= totalCents) {
    status = "paid";
  } else if (dateKey(installment.due_date) < todayInColombia()) {
    status = "overdue";
  } else {
    status = "pending";
  }

  await installment.update(
    {
      paid_amount: paidCents / 100,
      status,
    },
    { transaction }
  );
}

function validateInstallmentId(value: unknown): number {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new InstallmentPaymentError(
      "A valid installment_id is required",
      400
    );
  }

  return id;
}

function validatePaymentMethod(value: unknown): PaymentMethod {
  const allowed: PaymentMethod[] = [
    "cash",
    "transfer",
    "deposit",
    "other",
  ];

  if (
    typeof value !== "string" ||
    !allowed.includes(value as PaymentMethod)
  ) {
    throw new InstallmentPaymentError(
      "The payment method must be cash, transfer, deposit or other",
      400
    );
  }

  return value as PaymentMethod;
}

function validatePaymentDate(
  value: unknown,
  required = false
): Date | string | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new InstallmentPaymentError(
        "A valid payment_date is required",
        400
      );
    }

    return undefined;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new InstallmentPaymentError(
        "Invalid payment_date",
        400
      );
    }

    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new InstallmentPaymentError(
      "Invalid payment_date",
      400
    );
  }

  const normalized = value.trim();
  const dateOnly = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      throw new InstallmentPaymentError(
        "Invalid payment_date",
        400
      );
    }

    return normalized;
  }

  if (Number.isNaN(new Date(normalized).getTime())) {
    throw new InstallmentPaymentError(
      "Invalid payment_date",
      400
    );
  }

  return normalized;
}

export class InstallmentPaymentService {
  static async create(input: PaymentInput) {
    const installmentId = validateInstallmentId(
      input.installment_id
    );
    const amountCents = toCents(
      input.amount as number | string
    );
    const paymentDate = validatePaymentDate(input.payment_date) ?? new Date();
    const method = validatePaymentMethod(input.method);

    return sequelize.transaction(async (transaction) => {
      const installments = await lockInstallments(
        [installmentId],
        transaction
      );

      const installment = installments.get(installmentId)!;

      if (installment.status === "cancelled") {
        throw new InstallmentPaymentError(
          "Cannot register a payment for a cancelled installment",
          409
        );
      }

      const paidCents = await getActivePaidCents(
        installmentId,
        transaction
      );
      const totalCents = toCents(
        String(installment.total_amount)
      );

      if (amountCents > totalCents - paidCents) {
        throw new InstallmentPaymentError(
          "The payment exceeds the installment's outstanding balance",
          409
        );
      }

      const payment = await InstallmentPayment.create(
        {
          installment_id: installmentId,
          payment_date: paymentDate,
          amount: amountCents / 100,
          reference: input.reference ?? null,
          method,
          status: "active",
        },
        { transaction }
      );

      await reconcileInstallment(installment, transaction);

      return payment;
    });
  }

  static async update(
    id: number,
    input: PaymentInput,
    replace = false
  ) {
    if (replace && input.installment_id === undefined) {
      validateInstallmentId(undefined);
    }

    if (replace && input.amount === undefined) {
      throw new InstallmentPaymentError(
        "A valid amount is required",
        400
      );
    }

    const paymentDate =
      input.payment_date !== undefined || replace
        ? validatePaymentDate(input.payment_date, true)
        : undefined;

    const method =
      input.method !== undefined || replace
        ? validatePaymentMethod(input.method)
        : undefined;

    return sequelize.transaction(async (transaction) => {
      const payment = await InstallmentPayment.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!payment) {
        throw new InstallmentPaymentError(
          "Installment payment not found",
          404
        );
      }

      if (payment.status === "cancelled") {
        throw new InstallmentPaymentError(
          "Cannot modify a cancelled installment payment",
          409
        );
      }

      const oldInstallmentId = payment.installment_id;
      const newInstallmentId = input.installment_id === undefined
        ? oldInstallmentId
        : validateInstallmentId(input.installment_id);

      const installments = await lockInstallments(
        [oldInstallmentId, newInstallmentId],
        transaction
      );

      const oldInstallment = installments.get(oldInstallmentId)!;
      const newInstallment = installments.get(newInstallmentId)!;

      const amountCents = input.amount === undefined
        ? toCents(String(payment.amount))
        : toCents(input.amount);

      if (payment.status === "active") {
        if (newInstallment.status === "cancelled") {
          throw new InstallmentPaymentError(
            "Cannot assign an active payment to a cancelled installment",
            409
          );
        }

        const otherPaidCents = await getActivePaidCents(
          newInstallmentId,
          transaction,
          payment.installment_id === newInstallmentId
            ? payment.id
            : undefined
        );

        const totalCents = toCents(
          String(newInstallment.total_amount)
        );

        if (amountCents > totalCents - otherPaidCents) {
          throw new InstallmentPaymentError(
            "The payment exceeds the installment's outstanding balance",
            409
          );
        }
      }

      const changes: Record<string, unknown> = {};

      if (replace || input.installment_id !== undefined) {
        changes.installment_id = newInstallmentId;
      }

      if (replace || input.payment_date !== undefined) {
        changes.payment_date = paymentDate;
      }

      if (replace || input.amount !== undefined) {
        changes.amount = amountCents / 100;
      }

      if (replace || input.reference !== undefined) {
        changes.reference = input.reference ?? null;
      }

      if (replace || input.method !== undefined) {
        changes.method = method;
      }

      await payment.update(changes, { transaction });

      await reconcileInstallment(oldInstallment, transaction);

      if (newInstallmentId !== oldInstallmentId) {
        await reconcileInstallment(newInstallment, transaction);
      }

      return payment;
    });
  }

  static async cancel(id: number) {
    return sequelize.transaction(async (transaction) => {
      const payment = await InstallmentPayment.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!payment) {
        throw new InstallmentPaymentError(
          "Installment payment not found",
          404
        );
      }

      const installments = await lockInstallments(
        [payment.installment_id],
        transaction
      );

      if (payment.status === "active") {
        await payment.update(
          { status: "cancelled" },
          { transaction }
        );
      }

      await reconcileInstallment(
        installments.get(payment.installment_id)!,
        transaction
      );

      return payment;
    });
  }


}
