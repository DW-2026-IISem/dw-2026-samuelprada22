import { Application } from "express";
import { MembersController } from "./members.controller";
import {
  authenticate,
  authorize,
} from "../../auth/access";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== RUTAS PROTEGIDAS CON JWT + RBAC ==================

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
  }
}
