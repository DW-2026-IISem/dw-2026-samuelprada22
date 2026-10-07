import { Request, Response } from "express";
import {
  CommitteeDecision,
  CommitteeDecisionI,
} from "./committee-decision.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class CommitteeDecisionController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const committee_decisions = await CommitteeDecision.findAll({
        where: { status: "active" },
      });

      res.status(200).json({ committee_decisions });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching committee decisions",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching committee decision",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as CommitteeDecisionI;

      const committee_decision =
        await CommitteeDecision.create({
          credit_application_id: body.credit_application_id,
          decision: body.decision ?? "pending",
          decision_date: body.decision_date ?? null,
          comments: body.comments ?? null,
          decided_by: body.decided_by ?? null,
          status: body.status ?? "active",
        });

      res.status(201).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error creating committee decision",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as CommitteeDecisionI;

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update({
        credit_application_id: body.credit_application_id,
        decision: body.decision ?? committee_decision.decision,
        decision_date:
          body.decision_date ?? committee_decision.decision_date,
        comments:
          body.comments ?? committee_decision.comments,
        decided_by:
          body.decided_by ?? committee_decision.decided_by,
        status: body.status ?? committee_decision.status,
      });

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error updating committee decision (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<CommitteeDecisionI>;

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update(body);

      res.status(200).json({ committee_decision });
    } catch (error) {
      res.status(500).json({
        error: "Error updating committee decision (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================

  /** Eliminación física */
  public async deletePhysical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.destroy();

      res.status(200).json({
        message: "Committee decision permanently deleted",
        id,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error deleting committee decision",
        detail: String(error),
      });
    }
  }

  /** Eliminación lógica → status = cancelled */
  public async deleteLogical(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const committee_decision =
        await CommitteeDecision.findByPk(id);

      if (!committee_decision) {
        res.status(404).json({
          error: "Committee decision not found",
        });
        return;
      }

      await committee_decision.update({
        status: "cancelled",
      });

      res.status(200).json({
        message: "Committee decision cancelled (logical delete)",
        committee_decision,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error cancelling committee decision",
        detail: String(error),
      });
    }
  }
}
