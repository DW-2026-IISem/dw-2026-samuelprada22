import { Application } from "express";
import { MembersController } from "./members.controller";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== ROUTES WITHOUT AUTHENTICATION / WITHOUT JWT MIDDLEWARE ==================

    // getAll
    app
      .route("/api/members")
      .get(
        this.membersController.getAll.bind(
          this.membersController
        )
      );

    // getOne
    app
      .route("/api/members/:id")
      .get(
        this.membersController.getOne.bind(
          this.membersController
        )
      );

    // create
    app
      .route("/api/members")
      .post(
        this.membersController.create.bind(
          this.membersController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/members/:id")
      .put(
        this.membersController.updatePut.bind(
          this.membersController
        )
      )
      .patch(
        this.membersController.updatePatch.bind(
          this.membersController
        )
      );
    
    // delete físico
    app
      .route("/api/members/:id")
      .delete(
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );

    // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );

    
    // delete físico
    app
      .route("/api/members/:id")
      .delete(
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );

    // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );

  }
}
