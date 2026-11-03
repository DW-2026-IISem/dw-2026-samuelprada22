import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Dashboard · Solia Express',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'members',
        title: 'Socios · Solia Express',
        loadComponent: () =>
          import('./features/members/member-list/member-list').then(
            (m) => m.MemberList,
          ),
      },
      {
        path: 'accounts',
        title: 'Cuentas · Solia Express',
        loadComponent: () =>
          import('./features/accounts/account-list/account-list').then(
            (m) => m.AccountList,
          ),
      },
      {
        path: 'movements',
        title: 'Movimientos · Solia Express',
        loadComponent: () =>
          import('./features/movements/movement-list/movement-list').then(
            (m) => m.MovementList,
          ),
      },
      {
        path: 'credit-applications',
        title: 'Solicitudes de crédito · Solia Express',
        loadComponent: () =>
          import('./features/credit-applications/credit-application-list/credit-application-list').then(
            (m) => m.CreditApplicationList,
          ),
      },
      {
        path: 'committee-decisions',
        title: 'Decisiones del comité · Solia Express',
        loadComponent: () =>
          import('./features/committee-decisions/committee-decision-list/committee-decision-list').then(
            (m) => m.CommitteeDecisionList,
          ),
      },
      {
        path: 'credits',
        title: 'Créditos · Solia Express',
        loadComponent: () =>
          import('./features/credits/credit-list/credit-list').then(
            (m) => m.CreditList,
          ),
      },
      {
        path: 'credits/:id',
        title: 'Detalle del crédito · Solia Express',
        loadComponent: () =>
          import('./features/credits/credit-detail/credit-detail').then(
            (m) => m.CreditDetail,
          ),
      },
      {
        path: 'installments',
        title: 'Cuotas · Solia Express',
        loadComponent: () =>
          import('./features/installments/installment-list/installment-list').then(
            (m) => m.InstallmentList,
          ),
      },
      {
        path: 'installments/:id',
        title: 'Detalle de la cuota · Solia Express',
        loadComponent: () =>
          import('./features/installments/installment-detail/installment-detail').then(
            (m) => m.InstallmentDetail,
          ),
      },
      {
        path: 'installment-payments',
        title: 'Pagos de cuotas · Solia Express',
        loadComponent: () =>
          import('./features/installment-payments/installment-payment-list/installment-payment-list').then(
            (m) => m.InstallmentPaymentList,
          ),
      },
      {
        path: 'rates',
        title: 'Tasas · Solia Express',
        loadComponent: () =>
          import('./features/rates/rate-list/rate-list').then(
            (m) => m.RateList,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'members',
  },
];
