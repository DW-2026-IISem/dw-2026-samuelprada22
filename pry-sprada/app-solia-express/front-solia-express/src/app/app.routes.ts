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
        redirectTo: 'members',
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
    ],
  },
  {
    path: '**',
    redirectTo: 'members',
  },
];
