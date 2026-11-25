import { Application, Router } from "express";
import { ResourceRolesController } from "./resource-roles.controller";
import { authenticate } from "../access/authenticate.middleware";
import { authorize } from "../access/authorize.middleware";

export class ResourceRolesRoutes {
  private readonly router: Router = Router();
  private readonly controller = new ResourceRolesController();

  public routes(app: Application): void {
    this.router.get(
      "/",
      authenticate,
      authorize,
      this.controller.getAll.bind(this.controller)
    );

    this.router.get(
      "/:id",
      authenticate,
      authorize,
      this.controller.getOne.bind(this.controller)
    );

    this.router.post(
      "/",
      authenticate,
      authorize,
      this.controller.grant.bind(this.controller)
    );

    this.router.put(
      "/roles/:id",
      authenticate,
      authorize,
      this.controller.reconcileRole.bind(this.controller)
    );

    this.router.patch(
      "/:id/deactivate",
      authenticate,
      authorize,
      this.controller.deactivate.bind(this.controller)
    );

    this.router.patch(
      "/:id/reactivate",
      authenticate,
      authorize,
      this.controller.reactivate.bind(this.controller)
    );

    app.use("/api/concesiones-rol", this.router);
  }
}
