import { Request, Response } from "express";
import { Transaction } from "sequelize";
import { sequelize } from "../../../database/db";
import { Installment, InstallmentI } from "./installment.model";
import { InstallmentPayment } from "../installment-payments/installment-payment.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

async function hasPaymentHistory(
  installmentId: number,
  transaction: Transaction
): Promise<boolean> {
  const count = await InstallmentPayment.count({
    where: { installment_id: installmentId },
    transaction,
  });

  return count > 0;
}

export class InstallmentController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const installments = await Installment.findAll({
        where: { status: "pending" },
      });

      res.status(200).json({ installments });
    } catch (error) {
      res.status(500).json({
        error: "Error al consultar las cuotas",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      res.status(200).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al consultar la cuota",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as InstallmentI;

      const installment = await Installment.create({
        credit_id: body.credit_id,
        number: body.number,
        due_date: body.due_date,
        principal_amount: body.principal_amount,
        interest_amount: body.interest_amount,
        total_amount: body.total_amount,
        // Estos campos son administrados por el backend.
        paid_amount: 0,
        status: "pending",
      });

      res.status(201).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear la cuota",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as InstallmentI;

      const installment = await sequelize.transaction(async (transaction) => {
        const current = await Installment.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!current) {
          return null;
        }

        if (await hasPaymentHistory(id, transaction)) {
          throw new Error("INSTALLMENT_HAS_PAYMENT_HISTORY");
        }

        await current.update(
          {
            credit_id: body.credit_id,
            number: body.number,
            due_date: body.due_date,
            principal_amount: body.principal_amount,
            interest_amount: body.interest_amount,
            total_amount: body.total_amount,
          },
          { transaction }
        );

        return current;
      });

      if (!installment) {
        res.status(404).json({ error: "Cuota no encontrada" });
        return;
      }

      res.status(200).json({ installment });
    } catch (error) {
      if (String(error).includes("INSTALLMENT_HAS_PAYMENT_HISTORY")) {
        res.status(409).json({
          error: "No se puede modificar una cuota que tiene historial de pagos",
        });
        return;
      }

      res.status(500).json({
        error: "Error al actualizar la cuota (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<InstallmentI>;

      const installment = await sequelize.transaction(async (transaction) => {
        const current = await Installment.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!current) {
          return null;
        }

        if (await hasPaymentHistory(id, transaction)) {
          throw new Error("INSTALLMENT_HAS_PAYMENT_HISTORY");
        }

        // Lista explícita: paid_amount y status no se aceptan del cliente.
        const changes: Partial<InstallmentI> = {};

        if (body.credit_id !== undefined) changes.credit_id = body.credit_id;
        if (body.number !== undefined) changes.number = body.number;
        if (body.due_date !== undefined) changes.due_date = body.due_date;
        if (body.principal_amount !== undefined) {
          changes.principal_amount = body.principal_amount;
        }
        if (body.interest_amount !== undefined) {
          changes.interest_amount = body.interest_amount;
        }
        if (body.total_amount !== undefined) {
          changes.total_amount = body.total_amount;
        }

        await current.update(changes, { transaction });
        return current;
      });

      if (!installment) {
        res.status(404).json({ error: "Cuota no encontrada" });
        return;
      }

      res.status(200).json({ installment });
    } catch (error) {
      if (String(error).includes("INSTALLMENT_HAS_PAYMENT_HISTORY")) {
        res.status(409).json({
          error: "No se puede modificar una cuota que tiene historial de pagos",
        });
        return;
      }

      res.status(500).json({
        error: "Error al actualizar la cuota (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física: solo se permite si nunca tuvo pagos. */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const deleted = await sequelize.transaction(async (transaction) => {
        const installment = await Installment.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!installment) {
          return false;
        }

        if (await hasPaymentHistory(id, transaction)) {
          throw new Error("INSTALLMENT_HAS_PAYMENT_HISTORY");
        }

        await installment.destroy({ transaction });
        return true;
      });

      if (!deleted) {
        res.status(404).json({ error: "Cuota no encontrada" });
        return;
      }

      res.status(200).json({
        message: "Cuota eliminada permanentemente",
        id,
      });
    } catch (error) {
      if (String(error).includes("INSTALLMENT_HAS_PAYMENT_HISTORY")) {
        res.status(409).json({
          error: "No se puede eliminar una cuota que tiene historial de pagos",
        });
        return;
      }

      res.status(500).json({
        error: "Error al eliminar la cuota",
        detail: String(error),
      });
    }
  }

  /** Cancelación lógica: solo se permite si nunca tuvo pagos. */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment = await sequelize.transaction(async (transaction) => {
        const current = await Installment.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!current) {
          return null;
        }

        if (await hasPaymentHistory(id, transaction)) {
          throw new Error("INSTALLMENT_HAS_PAYMENT_HISTORY");
        }

        await current.update(
          { status: "cancelled" },
          { transaction }
        );

        return current;
      });

      if (!installment) {
        res.status(404).json({ error: "Cuota no encontrada" });
        return;
      }

      res.status(200).json({
        message: "Cuota cancelada",
        installment,
      });
    } catch (error) {
      if (String(error).includes("INSTALLMENT_HAS_PAYMENT_HISTORY")) {
        res.status(409).json({
          error: "No se puede cancelar una cuota que tiene historial de pagos",
        });
        return;
      }

      res.status(500).json({
        error: "Error al cancelar la cuota",
        detail: String(error),
      });
    }
  }
}
