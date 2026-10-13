import { Application } from "express";
import { CommitteeDecisionController } from "./committee-decision.controller";
import { authenticate, authorize } from "../../auth/access";

export class CommitteeDecisionRoutes {
  public committeeDecisionController: CommitteeDecisionController =
    new CommitteeDecisionController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/committee-decisions")
      .get(
        authenticate,
        authorize,
        this.committeeDecisionController.getAll.bind(
          this.committeeDecisionController
        )
      );

    // getOne
    app
      .route("/api/committee-decisions/:id")
      .get(
        authenticate,
        authorize,
        this.committeeDecisionController.getOne.bind(
          this.committeeDecisionController
        )
      );

    // create
    app
      .route("/api/committee-decisions")
      .post(
        authenticate,
        authorize,
        this.committeeDecisionController.create.bind(
          this.committeeDecisionController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/committee-decisions/:id")
      .put(
        authenticate,
        authorize,
        this.committeeDecisionController.updatePut.bind(
          this.committeeDecisionController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.committeeDecisionController.updatePatch.bind(
          this.committeeDecisionController
        )
      );

    // delete físico
    app
      .route("/api/committee-decisions/:id")
      .delete(
        authenticate,
        authorize,
        this.committeeDecisionController.deletePhysical.bind(
          this.committeeDecisionController
        )
      );

    // delete lógico
    app
      .route("/api/committee-decisions/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.committeeDecisionController.deleteLogical.bind(
          this.committeeDecisionController
        )
      );
  }
}
