import { Request, Response } from "express";
import { Movement, MovementI } from "./movement.model";
import { Account } from "../account/account.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

async function assertAccountExists(
  account_id: number
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const account = await Account.findByPk(account_id);

  if (!account) {
    return {
      ok: false,
      status: 404,
      error: "Account not found",
    };
  }

  if (account.status !== "active") {
    return {
      ok: false,
      status: 400,
      error: "Account must be active",
    };
  }

  return { ok: true };
}

export class MovementController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const movements = await Movement.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ movements });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching movements",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching movement",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as MovementI;

      const check = await assertAccountExists(
        Number(body.account_id)
      );

      if (!check.ok) {
        res.status(check.status).json({
          error: check.error,
        });
        return;
      }

      const movement = await Movement.create({
        account_id: body.account_id,
        reference_id: body.reference_id ?? null,
        type: body.type,
        date: body.date,
        amount: body.amount,
        observations: body.observations ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error creating movement",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as MovementI;

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      const check = await assertAccountExists(
        Number(body.account_id)
      );

      if (!check.ok) {
        res.status(check.status).json({
          error: check.error,
        });
        return;
      }

      await movement.update({
        account_id: body.account_id,
        reference_id: body.reference_id ?? null,
        type: body.type,
        date: body.date,
        amount: body.amount,
        observations: body.observations ?? null,
        status: body.status ?? movement.status,
      });

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error updating movement (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<MovementI>;

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      if (body.account_id !== undefined) {
        const check = await assertAccountExists(
          Number(body.account_id)
        );

        if (!check.ok) {
          res.status(check.status).json({
            error: check.error,
          });
          return;
        }
      }

      await movement.update(body);

      res.status(200).json({ movement });
    } catch (error) {
      res.status(500).json({
        error: "Error updating movement (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      await movement.destroy();

      res.status(200).json({
        message: "Movement permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting movement",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const movement = await Movement.findByPk(id);

      if (!movement) {
        res.status(404).json({
          error: "Movement not found",
        });
        return;
      }

      await movement.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Movement deactivated (logical delete)",
        movement,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating movement",
        detail: String(error),
      });
    }
  }
}
