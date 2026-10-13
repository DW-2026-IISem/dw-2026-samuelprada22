import { Application } from "express";
import { InstallmentPaymentController } from "./installment-payment.controller";
import { authenticate, authorize } from "../../auth/access";

export class InstallmentPaymentRoutes {
  public installmentPaymentController: InstallmentPaymentController =
    new InstallmentPaymentController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/installment-payments")
      .get(
        authenticate,
        authorize,
        this.installmentPaymentController.getAll.bind(
          this.installmentPaymentController
        )
      );

    // getOne
    app
      .route("/api/installment-payments/:id")
      .get(
        authenticate,
        authorize,
        this.installmentPaymentController.getOne.bind(
          this.installmentPaymentController
        )
      );

    // create
    app
      .route("/api/installment-payments")
      .post(
        authenticate,
        authorize,
        this.installmentPaymentController.create.bind(
          this.installmentPaymentController
        )
      );

    // update (PUT / PATCH)
    app
      .route("/api/installment-payments/:id")
      .put(
        authenticate,
        authorize,
        this.installmentPaymentController.updatePut.bind(
          this.installmentPaymentController
        )
      )
      .patch(
        authenticate,
        authorize,
        this.installmentPaymentController.updatePatch.bind(
          this.installmentPaymentController
        )
      );

    // delete físico
    app
      .route("/api/installment-payments/:id")
      .delete(
        authenticate,
        authorize,
        this.installmentPaymentController.deletePhysical.bind(
          this.installmentPaymentController
        )
      );

    // delete lógico
    app
      .route("/api/installment-payments/:id/deactivate")
      .patch(
        authenticate,
        authorize,
        this.installmentPaymentController.deleteLogical.bind(
          this.installmentPaymentController
        )
      );
  }
}
