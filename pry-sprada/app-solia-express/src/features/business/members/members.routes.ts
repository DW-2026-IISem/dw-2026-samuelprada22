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
  }
}
