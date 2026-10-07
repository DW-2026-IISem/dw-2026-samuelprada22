import { Application } from "express";
import { SessionController } from "./session.controller";
import { authenticate } from "../access";

/**
 * Rutas del feature Session.
 *
 * | Ruta | Modalidad | Middleware |
 * |---|---|---|
 * | POST /api/sesion/login   | OPEN | — |
 * | POST /api/sesion/refresh | OPEN | — |
 * | POST /api/sesion/logout  | OPEN | — |
 * | GET  /api/sesion/perfil  | JWT | authenticate |
 * | GET  /api/permisos       | JWT | authenticate |
 *
 * Ninguna ruta utiliza `authorize`.
 * La autorización granular corresponde a los recursos protegidos
 * por la matriz RBAC.
 */
export class SessionRoutes {
  public sessionController: SessionController =
    new SessionController();

  public routes(app: Application): void {
    // ================== OPEN ==================

    app
      .route("/api/sesion/login")
      .post(
        this.sessionController.login.bind(
          this.sessionController
        )
      );

    app
      .route("/api/sesion/refresh")
      .post(
        this.sessionController.refresh.bind(
          this.sessionController
        )
      );

    app
      .route("/api/sesion/logout")
      .post(
        this.sessionController.logout.bind(
          this.sessionController
        )
      );

    // ================== JWT ==================

    app
      .route("/api/sesion/perfil")
      .get(
        authenticate,
        this.sessionController.profile.bind(
          this.sessionController
        )
      );

    app
      .route("/api/permisos")
      .get(
        authenticate,
        this.sessionController.myPermissions.bind(
          this.sessionController
        )
      );
  }
}
