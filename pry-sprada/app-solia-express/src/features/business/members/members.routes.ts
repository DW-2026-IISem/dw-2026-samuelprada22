import { Application } from "express";
import { MembersController } from "./members.controller";

export class MembersRoutes {
  public membersController: MembersController = new MembersController();

  public routes(app: Application): void {
    // ================== ROUTES WITHOUT AUTHENTICATION / WITHOUT JWT MIDDLEWARE ==================
    // (to be completed in ISS-03-B…E)
  }
}
