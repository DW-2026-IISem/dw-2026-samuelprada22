import { Application } from "express";
import { MembersController } from "./members.controller";
import { authenticate } from "../../auth/access/authenticate.middleware";
import { authorize } from "../../auth/access/authorize.middleware";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== ROUTES WITH JWT + RBAC ==================

    // getAll
    app
      .route("/api/members")
      .get(
        authenticate,
        authorize,
        this.membersController.getAll.bind(
          this.membersController
        )
      );

    // getOne
    app
      .route("/api/members/:id")
      .get(
        authenticate,
        authorize,
        this.membersController.getOne.bind(
          this.membersController
        )
      );

    // create
    app
      .route("/api/members")
      .post(
        authenticate,
        authorize,
        this.membersController.create.bind(
          this.membersController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/members/:id")
      .put(
        authenticate,
        authorize,
        this.membersController.updatePut.bind(
          this.membersController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.membersController.updatePatch.bind(
          this.membersController
        )
      );
    
    // delete físico
    app
      .route("/api/members/:id")
      .delete(
        authenticate,
        authorize,
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );

    // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );

    
    // delete físico
    app
      .route("/api/members/:id")
      .delete(
        authenticate,
        authorize,
        this.membersController.deletePhysical.bind(
          this.membersController
        )
      );

    // delete lógico
    app
      .route("/api/members/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.membersController.deleteLogical.bind(
          this.membersController
        )
      );

  }
}
