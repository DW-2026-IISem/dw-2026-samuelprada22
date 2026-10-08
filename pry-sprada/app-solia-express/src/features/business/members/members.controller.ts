import { Request, Response } from "express";
import { Member, MemberI } from "./members.model";

function paramId(req: Request): number {
  const raw = req.params.id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Number(value);
}

export class MembersController {
  // ================== READ ==================

  public async getAll(req: Request, res: Response) {
    try {
      const members = await Member.findAll({
        where: { isActive: true },
      });

      res.status(200).json({ members });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching members",
        detail: String(error),
      });
    }
  }

  public async getOne(req: Request, res: Response) {
    try {
      const id = paramId(req);

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error fetching member",
        detail: String(error),
      });
    }
  }

  // ================== CREATE ==================

  public async create(req: Request, res: Response) {
    try {
      const body = req.body as MemberI;

      const member = await Member.create({
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
      });

      res.status(201).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error creating member",
        detail: String(error),
      });
    }
  }

  // ================== UPDATE ==================

  public async updatePut(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as MemberI;

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update({
        name: body.name,
        description: body.description,
        isActive: body.isActive,
      });

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error updating member (PUT)",
        detail: String(error),
      });
    }
  }

  public async updatePatch(req: Request, res: Response) {
    try {
      const id = paramId(req);
      const body = req.body as Partial<MemberI>;

      const member = await Member.findByPk(id);

      if (!member) {
        res.status(404).json({
          error: "Member not found",
        });
        return;
      }

      await member.update(body);

      res.status(200).json({ member });
    } catch (error) {
      res.status(500).json({
        error: "Error updating member (PATCH)",
        detail: String(error),
      });
    }
  }

  // ================== DELETE ==================
  // (rellenar en ISS-03-E)
}
