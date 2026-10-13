import { Request, Response } from "express";
import { Audit, AuditI } from "./audit.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class AuditController {
  // ================== READ ==================
  public async getAll(req: Request, res: Response) {
    try {
      const audits = await Audit.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ audits });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching audits",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const audit = await Audit.findByPk(id);

      if (!audit) {
        res.status(404).json({
          error: "Audit not found",
        });
        return;
      }

      res.status(200).json({ audit });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching audit",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================
  public async create(req: Request, res: Response) {
    try {
      const body = req.body as AuditI;

      const audit = await Audit.create({
        actor_user_id: body.actor_user_id,
        action: body.action,
        entity: body.entity,
        entity_id: body.entity_id,
        data: body.data ?? null,
      });

      res.status(201).json({ audit });
    } catch (error) {
      res.status(500).json({
        error: "Error creating audit",
        detail: String(error),
      });
    }
  }
}
