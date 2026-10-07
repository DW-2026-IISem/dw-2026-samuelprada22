import { Application } from "express";
import { UsersController } from "./users.controller";
import { authenticate, authorize } from "../access";

/**
 * Rutas del feature Users — modalidad JWT + RBAC.
 *
 * Todas las operaciones están protegidas por:
 * authenticate -> verifica JWT
 * authorize    -> verifica la concesión concreta en RBAC
 */
export class UsersRoutes {
  public usersController: UsersController =
    new UsersController();

  public routes(app: Application): void {
    // ================== READ ==================

    // GET /api/usuarios
    app
      .route("/api/usuarios")
      .get(
        authenticate,
        authorize,
        this.usersController.getAll.bind(
          this.usersController
        )
      );

    // GET /api/usuarios/:id
    app
      .route("/api/usuarios/:id")
      .get(
        authenticate,
        authorize,
        this.usersController.getOne.bind(
          this.usersController
        )
      );

    // ================== CREATE ==================

    // POST /api/usuarios
    app
      .route("/api/usuarios")
      .post(
        authenticate,
        authorize,
        this.usersController.create.bind(
          this.usersController
        )
      );

    // ================== UPDATE ==================

    // PUT /api/usuarios/:id
    // PATCH /api/usuarios/:id
    app
      .route("/api/usuarios/:id")
      .put(
        authenticate,
        authorize,
        this.usersController.updatePut.bind(
          this.usersController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.usersController.updatePatch.bind(
          this.usersController
        )
      );

    // ================== DELETE ==================

    // DELETE /api/usuarios/:id
    app
      .route("/api/usuarios/:id")
      .delete(
        authenticate,
        authorize,
        this.usersController.deletePhysical.bind(
          this.usersController
        )
      );

    // PATCH /api/usuarios/:id/deactivate
    app
      .route("/api/usuarios/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.usersController.deleteLogical.bind(
          this.usersController
        )
      );

    // ================== SECURITY ==================

    // PATCH /api/usuarios/:id/password
    app
      .route("/api/usuarios/:id/password")
      .patch(
        authenticate,
        authorize,
        this.usersController.changePassword.bind(
          this.usersController
        )
      );

    // GET /api/usuarios/:id/permisos
    app
      .route("/api/usuarios/:id/permisos")
      .get(
        authenticate,
        authorize,
        this.usersController.getEffectivePermissions.bind(
          this.usersController
        )
      );
  }
}
