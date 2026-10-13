import { Application } from "express";

import { MembersRoutes } from "../features/business/members/members.routes";
import { AccountRoutes } from "../features/business/account/account.routes";
import { MovementRoutes } from "../features/business/movements/movement.routes";
import { AuditRoutes } from "../features/business/audit/audit.routes";
import { CreditApplicationRoutes } from "../features/business/credit-applications/credit-application.routes";
import { CreditRoutes } from "../features/business/credits/credit.routes";
import { RateRoutes } from "../features/business/rates/rate.routes";
import { InstallmentRoutes } from "../features/business/installments/installment.routes";
import { InstallmentPaymentRoutes } from "../features/business/installment-payments/installment-payment.routes";
import { CommitteeDecisionRoutes } from "../features/business/committee-decisions/committee-decision.routes";

import { UsersRoutes } from "../features/auth/users/users.routes";
import { RolesRoutes } from "../features/auth/roles/roles.routes";
import { ResourcesRoutes } from "../features/auth/resources/resources.routes";
import { RoleUsersRoutes } from "../features/auth/role-users/role-users.routes";
import { SessionRoutes } from "../features/auth/sessions/session.routes";

export class Routes {
  public membersRoutes = new MembersRoutes();
  public accountRoutes = new AccountRoutes();
  public movementRoutes = new MovementRoutes();
  public auditRoutes = new AuditRoutes();
  public creditApplicationRoutes = new CreditApplicationRoutes();
  public creditRoutes = new CreditRoutes();
  public rateRoutes = new RateRoutes();
  public installmentRoutes = new InstallmentRoutes();
  public installmentPaymentRoutes = new InstallmentPaymentRoutes();
  public committeeDecisionRoutes = new CommitteeDecisionRoutes();

  public usersRoutes = new UsersRoutes();
  public rolesRoutes = new RolesRoutes();
  public resourcesRoutes = new ResourcesRoutes();
  public roleUsersRoutes = new RoleUsersRoutes();
  public sessionRoutes = new SessionRoutes();

  public routes(app: Application): void {
    this.membersRoutes.routes(app);
    this.accountRoutes.routes(app);
    this.movementRoutes.routes(app);
    this.auditRoutes.routes(app);
    this.creditApplicationRoutes.routes(app);
    this.creditRoutes.routes(app);
    this.rateRoutes.routes(app);
    this.installmentRoutes.routes(app);
    this.installmentPaymentRoutes.routes(app);
    this.committeeDecisionRoutes.routes(app);

    this.usersRoutes.routes(app);
    this.rolesRoutes.routes(app);
    this.resourcesRoutes.routes(app);
    this.roleUsersRoutes.routes(app);
    this.sessionRoutes.routes(app);
  }
}
