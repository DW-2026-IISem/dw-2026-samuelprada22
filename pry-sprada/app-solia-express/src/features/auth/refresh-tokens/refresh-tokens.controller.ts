import { Request, Response } from "express";
import { BaseController } from "../../../shared/http/base-controller";
import { requireAuthUser } from "../../../shared/auth/auth-user";
import { RefreshTokensService } from "./refresh-tokens.service";

/**
 * Controller del feature RefreshTokens.
 *
 * Estas operaciones funcionan bajo modalidad JWT y no utilizan RBAC.
 * El usuario solamente puede consultar y revocar sus propias sesiones.
 */
export class RefreshTokensController extends BaseController {
  public constructor(
    private readonly service: RefreshTokensService =
      new RefreshTokensService()
  ) {
    super();
  }

  // ================== READ ==================

  /**
   * Lista las sesiones activas del usuario autenticado.
   */
  public async getAll(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.run(res, async () => {
      const sessions =
        await this.service.getAllMine(
          requireAuthUser(req).id
        );

      res.status(200).json({ sessions });
    });
  }

  /**
   * Obtiene una sesión propia por ID.
   */
  public async getOne(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.run(res, async () => {
      const session =
        await this.service.getMine(
          requireAuthUser(req).id,
          this.paramId(req)
        );

      res.status(200).json({ session });
    });
  }

  // ================== STATE ==================

  /**
   * Revoca todas las sesiones del usuario autenticado.
   */
  public async revokeAll(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.run(res, async () => {
      const revoked =
        await this.service.revokeAllMine(
          requireAuthUser(req).id
        );

      res.status(200).json({
        message: "All sessions revoked",
        revoked,
      });
    });
  }

  /**
   * Revoca una sesión propia.
   */
  public async revokeOne(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.run(res, async () => {
      const session =
        await this.service.revokeMine(
          requireAuthUser(req).id,
          this.paramId(req)
        );

      res.status(200).json({
        message: "Session revoked",
        session,
      });
    });
  }

  // ================== PURGE ==================

  /**
   * Elimina físicamente las sesiones propias inactivas o expiradas.
   */
  public async purge(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.run(res, async () => {
      const purged =
        await this.service.purgeMine(
          requireAuthUser(req).id
        );

      res.status(200).json({
        message: "Inactive sessions purged",
        purged,
      });
    });
  }
}
