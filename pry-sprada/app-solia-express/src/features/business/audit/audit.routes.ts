import { Application } from "express";
import { AuditController } from "./audit.controller";
import { authenticate, authorize } from "../../auth/access";

export class AuditRoutes {
  public auditController: AuditController = new AuditController();

  public routes(app: Application): void {
    // getAll
    app
      .route("/api/audits")
      .get(
        authenticate,
        authorize,
        this.auditController.getAll.bind(this.auditController)
      );

    // getOne
    app
      .route("/api/audits/:id")
      .get(
        authenticate,
        authorize,
        this.auditController.getOne.bind(this.auditController)
      );

    // create
    app
      .route("/api/audits")
      .post(
        authenticate,
        authorize,
        this.auditController.create.bind(this.auditController)
      );
  }
}
