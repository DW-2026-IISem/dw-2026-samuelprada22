import { Request, Response } from "express";
import { Account, AccountI } from "./account.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class AccountController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const accounts = await Account.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ accounts });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching accounts",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching account",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as AccountI;

      const account = await Account.create({
        member_id: body.member_id,
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? "active",
      });

      res.status(201).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error creating account",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as AccountI;

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update({
        member_id: body.member_id,
        name: body.name,
        description: body.description ?? null,
        status: body.status ?? account.status,
      });

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error updating account (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<AccountI>;

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update(body);

      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({
        error: "Error updating account (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.destroy();

      res.status(200).json({
        message: "Account permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting account",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = inactive */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const account = await Account.findByPk(id);

      if (!account) {
        res.status(404).json({
          error: "Account not found",
        });
        return;
      }

      await account.update({
        status: "inactive",
      });

      res.status(200).json({
        message: "Account deactivated (logical delete)",
        account,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deactivating account",
        detail: String(error),
      });
    }
  }
}
