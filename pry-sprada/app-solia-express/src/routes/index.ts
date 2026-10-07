import { Application } from "express";

import { MembersRoutes } from "../features/business/members/members.routes";
import { AccountRoutes } from "../features/business/account/account.routes";
import { MovementRoutes } from "../features/business/movements/movement.routes";
import { CreditApplicationRoutes } from "../features/business/credit-applications/credit-application.routes";
import { CreditRoutes } from "../features/business/credits/credit.routes";
import { RateRoutes } from "../features/business/rates/rate.routes";
import { InstallmentRoutes } from "../features/business/installments/installment.routes";
import { InstallmentPaymentRoutes } from "../features/business/installment-payments/installment-payment.routes";
import { CommitteeDecisionRoutes } from "../features/business/committee-decisions/committee-decision.routes";
import { AuditRoutes } from "../features/business/audit/audit.routes";
import { SessionRoutes } from "../features/auth/sessions/session.routes";

export class Routes {
  public committeeDecisionRoutes: CommitteeDecisionRoutes =
    new CommitteeDecisionRoutes();
  public membersRoutes: MembersRoutes =
    new MembersRoutes();

  public accountRoutes: AccountRoutes =
    new AccountRoutes();

  public movementRoutes: MovementRoutes =
    new MovementRoutes();

  public rateRoutes: RateRoutes = new RateRoutes();

  public installmentRoutes: InstallmentRoutes = new InstallmentRoutes();
  public installmentPaymentRoutes: InstallmentPaymentRoutes = new InstallmentPaymentRoutes();
  public creditApplicationRoutes: CreditApplicationRoutes =
    new CreditApplicationRoutes();

  public creditRoutes: CreditRoutes = new CreditRoutes();
  public auditRoutes: AuditRoutes = new AuditRoutes();
  public sessionRoutes: SessionRoutes = new SessionRoutes();

  public routes(app: Application): void {
    // ================== RUTAS DE SESIÓN ==================

    this.sessionRoutes.routes(app);

    // ================== RUTAS DE NEGOCIO ==================

    this.membersRoutes.routes(app);
    this.accountRoutes.routes(app);
    this.movementRoutes.routes(app);
    this.creditApplicationRoutes.routes(app);
    this.creditRoutes.routes(app);
    this.rateRoutes.routes(app);
    this.installmentRoutes.routes(app);
    this.installmentPaymentRoutes.routes(app);
    this.committeeDecisionRoutes.routes(app);
    this.auditRoutes.routes(app);
  }
}
