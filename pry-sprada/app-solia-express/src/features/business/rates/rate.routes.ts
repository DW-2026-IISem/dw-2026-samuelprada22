import { Application } from "express";
import { RateController } from "./rate.controller";
import { authenticate, authorize } from "../../auth/access";

export class RateRoutes {
  public rateController: RateController =
    new RateController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/rates")
      .get(
        authenticate,
        authorize,
        this.rateController.getAll.bind(
          this.rateController
        )
      );

    // getOne
    app
      .route("/api/rates/:id")
      .get(
        authenticate,
        authorize,
        this.rateController.getOne.bind(
          this.rateController
        )
      );

    // create
    app
      .route("/api/rates")
      .post(
        authenticate,
        authorize,
        this.rateController.create.bind(
          this.rateController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/rates/:id")
      .put(
        authenticate,
        authorize,
        this.rateController.updatePut.bind(
          this.rateController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.rateController.updatePatch.bind(
          this.rateController
        )
      );

    // delete físico
    app
      .route("/api/rates/:id")
      .delete(
        authenticate,
        authorize,
        this.rateController.deletePhysical.bind(
          this.rateController
        )
      );

    // delete lógico
    app
      .route("/api/rates/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.rateController.deleteLogical.bind(
          this.rateController
        )
      );
  }
}
