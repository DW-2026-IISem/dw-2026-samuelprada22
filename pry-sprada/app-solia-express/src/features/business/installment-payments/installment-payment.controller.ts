import { Request, Response } from "express";
import {
  InstallmentPayment,
  InstallmentPaymentI,
} from "./installment-payment.model";
import {
  InstallmentPaymentError,
  InstallmentPaymentService,
} from "./installment-payment.service";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

function handleError(
  res: Response,
  error: unknown,
  message: string
): void {
  if (error instanceof InstallmentPaymentError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  res.status(500).json({
    error: message,
    detail: String(error),
  });
}

export class InstallmentPaymentController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      // Incluye pagos activos y cancelados para conservar el historial.
      const installment_payments = await InstallmentPayment.findAll();

      res.status(200).json({ installment_payments });
    } catch (error) {
      handleError(res, error, "Error fetching installment payments");
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
      handleError(res, error, "Error fetching installment payment");
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPaymentService.create(body);

      res.status(201).json({ installment_payment });
    } catch (error) {
      handleError(res, error, "Error creating installment payment");
    }
  }

  // ================== UPDATE ==================
  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as InstallmentPaymentI;

      const installment_payment =
        await InstallmentPaymentService.update(id, body, true);

      res.status(200).json({ installment_payment });
    } catch (error) {
      handleError(res, error, "Error updating installment payment (PUT)");
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<InstallmentPaymentI>;

      const installment_payment =
        await InstallmentPaymentService.update(id, body);

      res.status(200).json({ installment_payment });
    } catch (error) {
      handleError(res, error, "Error updating installment payment (PATCH)");
    }
  }

  /** Cancelación lógica: status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const installment_payment =
        await InstallmentPaymentService.cancel(id);

      res.status(200).json({
        message: "Installment payment cancelled",
        installment_payment,
      });
    } catch (error) {
      handleError(res, error, "Error cancelling installment payment");
    }
  }
}
