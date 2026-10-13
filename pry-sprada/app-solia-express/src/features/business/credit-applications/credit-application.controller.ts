import { Request, Response } from "express";
import {
  CreditApplication,
  CreditApplicationI,
} from "./credit-application.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CreditApplicationController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const credit_applications =
        await CreditApplication.findAll();

      res.status(200).json({ credit_applications });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al obtener las solicitudes de crédito",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al obtener la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      const credit_application =
        await CreditApplication.create({
          member_id: body.member_id,
          reference_id: body.reference_id ?? null,
          date: body.date ?? new Date(),
          amount: body.amount,
          status: body.status ?? "pending",
          observations:
            body.observations ?? null,
        });

      res.status(201).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al crear la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body = req.body as CreditApplicationI;

      if (!body.member_id) {
        res.status(400).json({
          error: "member_id es obligatorio",
        });
        return;
      }

      if (!body.amount || Number(body.amount) <= 0) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        member_id: body.member_id,
        reference_id:
          body.reference_id ?? null,
        date: body.date,
        amount: body.amount,
        status: body.status,
        observations:
          body.observations ?? null,
      });

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al actualizar la solicitud de crédito (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      const body =
        req.body as Partial<CreditApplicationI>;

      if (
        body.amount !== undefined &&
        Number(body.amount) <= 0
      ) {
        res.status(400).json({
          error: "amount debe ser mayor que 0",
        });
        return;
      }

      await credit_application.update({
        ...(body.member_id !== undefined && {
          member_id: body.member_id,
        }),

        ...(body.reference_id !== undefined && {
          reference_id: body.reference_id,
        }),

        ...(body.date !== undefined && {
          date: body.date,
        }),

        ...(body.amount !== undefined && {
          amount: body.amount,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),

        ...(body.observations !== undefined && {
          observations: body.observations,
        }),
      });

      res.status(200).json({
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al actualizar la solicitud de crédito (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /**
   * Eliminación física de la solicitud de crédito.
   */
  public async deletePhysical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.destroy();

      res.status(200).json({
        message:
          "Solicitud de crédito eliminada correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al eliminar la solicitud de crédito",
        detail: String(error),
      });
    }
  }

  /**
   * Eliminación lógica → status = cancelled.
   */
  public async deleteLogical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);

      const credit_application =
        await CreditApplication.findByPk(id);

      if (!credit_application) {
        res.status(404).json({
          error: "Solicitud de crédito no encontrada",
        });
        return;
      }

      await credit_application.update({
        status: "cancelled",
      });

      res.status(200).json({
        message:
          "Solicitud de crédito cancelada correctamente",
        credit_application,
      });
    } catch (error) {
      res.status(500).json({
        error:
          "Error al cancelar la solicitud de crédito",
        detail: String(error),
      });
    }
  }
}
