import { Request, Response } from "express";
import { Credit, CreditI } from "./credit.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CreditController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const credits = await Credit.findAll();

      res.status(200).json({ credits });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener los créditos",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener el crédito",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CreditI;

      if (!body.credit_application_id) {
        res.status(400).json({
          error: "credit_application_id es obligatorio",
        });
        return;
      }

      if (!body.rate_id) {
        res.status(400).json({
          error: "rate_id es obligatorio",
        });
        return;
      }

      if (
        body.approved_amount === undefined ||
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (!body.term || Number(body.term) <= 0) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate === undefined ||
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      const credit = await Credit.create({
        credit_application_id: body.credit_application_id,
        rate_id: body.rate_id,
        date: body.date ?? new Date(),
        approved_amount: body.approved_amount,
        term: body.term,
        interest_rate: body.interest_rate,
        status: body.status ?? "active",
        observations: body.observations ?? null,
      });

      res.status(201).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear el crédito",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      const body = req.body as CreditI;

      if (!body.credit_application_id) {
        res.status(400).json({
          error: "credit_application_id es obligatorio",
        });
        return;
      }

      if (!body.rate_id) {
        res.status(400).json({
          error: "rate_id es obligatorio",
        });
        return;
      }

      if (
        body.approved_amount === undefined ||
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (!body.term || Number(body.term) <= 0) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate === undefined ||
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      await credit.update({
        credit_application_id: body.credit_application_id,
        rate_id: body.rate_id,
        date: body.date,
        approved_amount: body.approved_amount,
        term: body.term,
        interest_rate: body.interest_rate,
        status: body.status,
        observations: body.observations ?? null,
      });

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar el crédito (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      const body = req.body as Partial<CreditI>;

      if (
        body.approved_amount !== undefined &&
        Number(body.approved_amount) <= 0
      ) {
        res.status(400).json({
          error: "approved_amount debe ser mayor que 0",
        });
        return;
      }

      if (
        body.term !== undefined &&
        Number(body.term) <= 0
      ) {
        res.status(400).json({
          error: "term debe ser mayor que 0",
        });
        return;
      }

      if (
        body.interest_rate !== undefined &&
        Number(body.interest_rate) < 0
      ) {
        res.status(400).json({
          error: "interest_rate no puede ser negativo",
        });
        return;
      }

      await credit.update({
        ...(body.credit_application_id !== undefined && {
          credit_application_id:
            body.credit_application_id,
        }),
        ...(body.rate_id !== undefined && {
          rate_id: body.rate_id,
        }),
        ...(body.date !== undefined && {
          date: body.date,
        }),
        ...(body.approved_amount !== undefined && {
          approved_amount: body.approved_amount,
        }),
        ...(body.term !== undefined && {
          term: body.term,
        }),
        ...(body.interest_rate !== undefined && {
          interest_rate: body.interest_rate,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      });

      res.status(200).json({
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar el crédito (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      await credit.destroy();

      res.status(200).json({
        message: "Crédito eliminado correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar el crédito",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit = await Credit.findByPk(id);

      if (!credit) {
        res.status(404).json({
          error: "Crédito no encontrado",
        });
        return;
      }

      await credit.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Crédito cancelado correctamente",
        credit,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al cancelar el crédito",
        detail: String(error),
      });
    }
  }
}
