import { Application } from "express";
import { InstallmentController } from "./installment.controller";
import { authenticate, authorize } from "../../auth/access";

export class InstallmentRoutes {
  public installmentController: InstallmentController =
    new InstallmentController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/installments")
      .get(
        authenticate,
        authorize,
        this.installmentController.getAll.bind(
          this.installmentController
        )
      );

    // getOne
    app
      .route("/api/installments/:id")
      .get(
        authenticate,
        authorize,
        this.installmentController.getOne.bind(
          this.installmentController
        )
      );

    // create
    app
      .route("/api/installments")
      .post(
        authenticate,
        authorize,
        this.installmentController.create.bind(
          this.installmentController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/installments/:id")
      .put(
        authenticate,
        authorize,
        this.installmentController.updatePut.bind(
          this.installmentController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.installmentController.updatePatch.bind(
          this.installmentController
        )
      );

    // delete físico
    app
      .route("/api/installments/:id")
      .delete(
        authenticate,
        authorize,
        this.installmentController.deletePhysical.bind(
          this.installmentController
        )
      );

    // delete lógico
    app
      .route("/api/installments/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.installmentController.deleteLogical.bind(
          this.installmentController
        )
      );
  }
}
