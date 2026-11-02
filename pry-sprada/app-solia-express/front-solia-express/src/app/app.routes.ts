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
    ],
  },
  {
    path: '**',
    redirectTo: 'members',
  },
];
