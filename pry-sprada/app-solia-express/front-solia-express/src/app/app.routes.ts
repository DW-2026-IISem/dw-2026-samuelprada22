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
    ],
  },
  {
    path: '**',
    redirectTo: 'members',
  },
];
