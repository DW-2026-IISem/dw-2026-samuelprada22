import { Request, Response } from "express";
import { Installment, InstallmentI } from "./installment.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
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
        paid_amount: body.paid_amount ?? 0,
        status: body.status ?? "pending",
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

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update({
        credit_id: body.credit_id,
        number: body.number,
        due_date: body.due_date,
        principal_amount: body.principal_amount,
        interest_amount: body.interest_amount,
        total_amount: body.total_amount,
        paid_amount: body.paid_amount ?? installment.paid_amount,
        status: body.status ?? installment.status,
      });

      res.status(200).json({ installment });
    } catch (error) {
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

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update(body);

      res.status(200).json({ installment });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la cuota (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.destroy();

      res.status(200).json({
        message: "Cuota eliminada permanentemente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar la cuota",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const installment = await Installment.findByPk(id);

      if (!installment) {
        res.status(404).json({
          error: "Cuota no encontrada",
        });
        return;
      }

      await installment.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Cuota cancelada (eliminación lógica)",
        installment,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al cancelar la cuota",
        detail: String(error),
      });
    }
  }
}
