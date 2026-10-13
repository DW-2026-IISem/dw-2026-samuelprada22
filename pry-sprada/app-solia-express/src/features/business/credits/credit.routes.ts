import { Application } from "express";
import { CreditController } from "./credit.controller";
import { authenticate, authorize } from "../../auth/access";

export class CreditRoutes {
  public creditController: CreditController =
    new CreditController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/credits")
      .get(
        authenticate,
        authorize,
        this.creditController.getAll.bind(
          this.creditController
        )
      );

    // getOne
    app
      .route("/api/credits/:id")
      .get(
        authenticate,
        authorize,
        this.creditController.getOne.bind(
          this.creditController
        )
      );

    // create
    app
      .route("/api/credits")
      .post(
        authenticate,
        authorize,
        this.creditController.create.bind(
          this.creditController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credits/:id")
      .put(
        authenticate,
        authorize,
        this.creditController.updatePut.bind(
          this.creditController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.creditController.updatePatch.bind(
          this.creditController
        )
      );

    // delete físico
    app
      .route("/api/credits/:id")
      .delete(
        authenticate,
        authorize,
        this.creditController.deletePhysical.bind(
          this.creditController
        )
      );

    // delete lógico
    app
      .route("/api/credits/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.creditController.deleteLogical.bind(
          this.creditController
        )
      );
  }
}
