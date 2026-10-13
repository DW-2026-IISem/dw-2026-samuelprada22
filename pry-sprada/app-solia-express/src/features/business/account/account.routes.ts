import { Application } from "express";
import { AccountController } from "./account.controller";
import { authenticate, authorize } from "../../auth/access";

export class AccountRoutes {
  public accountController: AccountController = new AccountController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/accounts")
      .get(
        authenticate,
        authorize,
        this.accountController.getAll.bind(
          this.accountController
        )
      );

    // getOne
    app
      .route("/api/accounts/:id")
      .get(
        authenticate,
        authorize,
        this.accountController.getOne.bind(
          this.accountController
        )
      );

    // create
    app
      .route("/api/accounts")
      .post(
        authenticate,
        authorize,
        this.accountController.create.bind(
          this.accountController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/accounts/:id")
      .put(
        authenticate,
        authorize,
        this.accountController.updatePut.bind(
          this.accountController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.accountController.updatePatch.bind(
          this.accountController
        )
      );

    // delete físico
    app
      .route("/api/accounts/:id")
      .delete(
        authenticate,
        authorize,
        this.accountController.deletePhysical.bind(
          this.accountController
        )
      );

    // delete lógico
    app
      .route("/api/accounts/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.accountController.deleteLogical.bind(
          this.accountController
        )
      );
  }
}
