import { Request, Response } from "express";
import { Rate, RateI } from "./rate.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class RateController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const rates = await Rate.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ rates });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener las tasas",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener la tasa",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as RateI;

      if (!body.name) {
        res.status(400).json({
          error: "name es obligatorio",
        });
        return;
      }

      if (
        body.percentage === undefined ||
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      if (!body.type) {
        res.status(400).json({
          error: "type es obligatorio",
        });
        return;
      }

      const rate = await Rate.create({
        name: body.name,
        percentage: body.percentage,
        type: body.type,
        description: body.description ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al crear la tasa",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as RateI;

      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      if (!body.name) {
        res.status(400).json({
          error: "name es obligatorio",
        });
        return;
      }

      if (
        body.percentage === undefined ||
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      if (!body.type) {
        res.status(400).json({
          error: "type es obligatorio",
        });
        return;
      }

      await rate.update({
        name: body.name,
        percentage: body.percentage,
        type: body.type,
        description: body.description ?? null,
        status: body.status ?? rate.status,
      });

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la tasa (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<RateI>;

      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      if (
        body.percentage !== undefined &&
        Number(body.percentage) < 0
      ) {
        res.status(400).json({
          error: "percentage debe ser mayor o igual a 0",
        });
        return;
      }

      await rate.update({
        ...(body.name !== undefined && {
          name: body.name,
        }),
        ...(body.percentage !== undefined && {
          percentage: body.percentage,
        }),
        ...(body.type !== undefined && {
          type: body.type,
        }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
      });

      res.status(200).json({ rate });
    } catch (error) {
      res.status(500).json({
        error: "Error al actualizar la tasa (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      await rate.destroy();

      res.status(200).json({
        message: "Tasa eliminada correctamente",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar la tasa",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(
    req: Request,
    res: Response
  ) {
    try {
      const id = paramId(req);
      const rate = await Rate.findByPk(id);

      if (!rate) {
        res.status(404).json({
          error: "Tasa no encontrada",
        });
        return;
      }

      await rate.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Tasa desactivada correctamente",
        rate,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al desactivar la tasa",
        detail: String(error),
      });
    }
  }
}
