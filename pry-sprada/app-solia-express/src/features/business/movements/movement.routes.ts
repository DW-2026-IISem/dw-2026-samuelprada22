import { Application } from "express";
import { MovementController } from "./movement.controller";
import { authenticate, authorize } from "../../auth/access";

export class MovementRoutes {
  public movementController: MovementController = new MovementController();

  public routes(app: Application): void {
    // ================== RUTAS JWT + RBAC ==================

    // getAll
    app
      .route("/api/movements")
      .get(
        authenticate,
        authorize,
        this.movementController.getAll.bind(this.movementController)
      );

    // getOne
    app
      .route("/api/movements/:id")
      .get(
        authenticate,
        authorize,
        this.movementController.getOne.bind(this.movementController)
      );

    // create
    app
      .route("/api/movements")
      .post(
        authenticate,
        authorize,
        this.movementController.create.bind(this.movementController)
      );

    // update (PUT / PATCH)
    app
      .route("/api/movements/:id")
      .put(
        authenticate,
        authorize,
        this.movementController.updatePut.bind(this.movementController)
      )
      .patch(
        authenticate,
        authorize,
        this.movementController.updatePatch.bind(this.movementController)
      );

    // delete físico
    app
      .route("/api/movements/:id")
      .delete(
        authenticate,
        authorize,
        this.movementController.deletePhysical.bind(
          this.movementController
        )
      );

    // delete lógico
    app
      .route("/api/movements/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.movementController.deleteLogical.bind(
          this.movementController
        )
      );
  }
}
