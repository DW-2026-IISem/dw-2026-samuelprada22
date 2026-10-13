import { Request, Response } from "express";
import {
  InstallmentPayment,
  InstallmentPaymentI,
} from "./installment-payment.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class InstallmentPaymentController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const installment_payments = await InstallmentPayment.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ installment_payments });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching installment payments",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching installment payment",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPayment.create({
          installment_id: body.installment_id,
          payment_date: body.payment_date ?? new Date(),
          amount: body.amount,
          reference: body.reference ?? null,
          method: body.method,
          status: body.status ?? "active",
        });

      res.status(201).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error creating installment payment",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update({
        installment_id: body.installment_id,
        payment_date: body.payment_date,
        amount: body.amount,
        reference: body.reference ?? null,
        method: body.method,
        status: body.status ?? installment_payment.status,
      });

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error updating installment payment (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<InstallmentPaymentI>;

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update(body);

      res.status(200).json({ installment_payment });
    } catch (error) {
      res.status(500).json({
        error: "Error updating installment payment (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.destroy();

      res.status(200).json({
        message: "Installment payment permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting installment payment",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment_payment =
        await InstallmentPayment.findByPk(id);

      if (!installment_payment) {
        res.status(404).json({
          error: "Installment payment not found",
        });
        return;
      }

      await installment_payment.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Installment payment cancelled (logical delete)",
        installment_payment,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error cancelling installment payment",
        detail: String(error),
      });
    }
  }
}
