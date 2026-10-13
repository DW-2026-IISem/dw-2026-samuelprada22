import { Application } from "express";
import { CreditApplicationController } from "./credit-application.controller";
import { authenticate, authorize } from "../../auth/access";

export class CreditApplicationRoutes {
  public creditApplicationController: CreditApplicationController =
    new CreditApplicationController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/credit-applications")
      .get(
        authenticate,
        authorize,
        this.creditApplicationController.getAll.bind(
          this.creditApplicationController
        )
      );

    // getOne
    app
      .route("/api/credit-applications/:id")
      .get(
        authenticate,
        authorize,
        this.creditApplicationController.getOne.bind(
          this.creditApplicationController
        )
      );

    // create
    app
      .route("/api/credit-applications")
      .post(
        authenticate,
        authorize,
        this.creditApplicationController.create.bind(
          this.creditApplicationController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/credit-applications/:id")
      .put(
        authenticate,
        authorize,
        this.creditApplicationController.updatePut.bind(
          this.creditApplicationController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.creditApplicationController.updatePatch.bind(
          this.creditApplicationController
        )
      );

    // delete físico
    app
      .route("/api/credit-applications/:id")
      .delete(
        authenticate,
        authorize,
        this.creditApplicationController.deletePhysical.bind(
          this.creditApplicationController
        )
      );

    // delete lógico
    app
      .route("/api/credit-applications/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.creditApplicationController.deleteLogical.bind(
          this.creditApplicationController
        )
      );
  }
}
