import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'iniciar-sesion',
    title: 'Iniciar sesión · Solia Express',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then(
        (m) => m.Login,
      ),
  },
  {
    path: 'construir',
    title: 'Prototipo de navegación · Solia Express',
    loadComponent: () =>
      import('./features/construir/construir').then(
        (m) => m.Construir,
      ),
  },
  {
    path: '',
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Dashboard · Solia Express',
        canActivate: [permissionGuard],
        data: {
          permissions: [
            'GET /api/members',
            'GET /api/accounts',
            'GET /api/movements',
            'GET /api/credit-applications',
            'GET /api/credits',
          ],
        },
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'acceso-denegado',
        title: 'Acceso denegado · Solia Express',
        loadComponent: () =>
          import('./features/errors/forbidden/forbidden').then(
            (m) => m.Forbidden,
          ),
      },
      {
        path: 'socios',
        title: 'Socios · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/members' },
        loadComponent: () =>
          import('./features/members/member-list/member-list').then(
            (m) => m.MemberList,
          ),
      },
      {
        path: 'cuentas',
        title: 'Cuentas · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/accounts' },
        loadComponent: () =>
          import('./features/accounts/account-list/account-list').then(
            (m) => m.AccountList,
          ),
      },
      {
        path: 'movimientos',
        title: 'Movimientos · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/movements' },
        loadComponent: () =>
          import('./features/movements/movement-list/movement-list').then(
            (m) => m.MovementList,
          ),
      },
      {
        path: 'solicitudes-credito',
        title: 'Solicitudes de crédito · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/credit-applications' },
        loadComponent: () =>
          import('./features/credit-applications/credit-application-list/credit-application-list').then(
            (m) => m.CreditApplicationList,
          ),
      },
      {
        path: 'decisiones-comite',
        title: 'Decisiones del comité · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/committee-decisions' },
        loadComponent: () =>
          import('./features/committee-decisions/committee-decision-list/committee-decision-list').then(
            (m) => m.CommitteeDecisionList,
          ),
      },
      {
        path: 'creditos',
        title: 'Créditos · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/credits' },
        loadComponent: () =>
          import('./features/credits/credit-list/credit-list').then(
            (m) => m.CreditList,
          ),
      },
      {
        path: 'creditos/:id',
        title: 'Detalle del crédito · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/credits/:id' },
        loadComponent: () =>
          import('./features/credits/credit-detail/credit-detail').then(
            (m) => m.CreditDetail,
          ),
      },
      {
        path: 'cuotas',
        title: 'Cuotas · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/installments' },
        loadComponent: () =>
          import('./features/installments/installment-list/installment-list').then(
            (m) => m.InstallmentList,
          ),
      },
      {
        path: 'cuotas/:id',
        title: 'Detalle de la cuota · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/installments/:id' },
        loadComponent: () =>
          import('./features/installments/installment-detail/installment-detail').then(
            (m) => m.InstallmentDetail,
          ),
      },
      {
        path: 'pagos-cuotas',
        title: 'Pagos de cuotas · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/installment-payments' },
        loadComponent: () =>
          import('./features/installment-payments/installment-payment-list/installment-payment-list').then(
            (m) => m.InstallmentPaymentList,
          ),
      },
      {
        path: 'tasas',
        title: 'Tasas · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/rates' },
        loadComponent: () =>
          import('./features/rates/rate-list/rate-list').then(
            (m) => m.RateList,
          ),
      },
      {
        path: 'admin/usuarios',
        title: 'Usuarios · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/usuarios' },
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list').then(
            (m) => m.UserList,
          ),
      },
      {
        path: 'admin/roles',
        title: 'Roles · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/roles' },
        loadComponent: () =>
          import('./features/admin/roles/role-list/role-list').then(
            (m) => m.RoleList,
          ),
      },
      {
        path: 'admin/recursos',
        title: 'Recursos · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/recursos' },
        loadComponent: () =>
          import('./features/admin/resources/resource-list/resource-list').then(
            (m) => m.ResourceList,
          ),
      },
      {
        path: 'admin/concesiones-rol',
        title: 'Concesiones de roles · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/concesiones-rol' },
        loadComponent: () =>
          import('./features/admin/resource-roles/resource-role-list/resource-role-list').then(
            (m) => m.ResourceRoleList,
          ),
      },
      {
        path: 'admin/asignaciones-rol',
        title: 'Asignaciones de roles · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/asignaciones-rol' },
        loadComponent: () =>
          import('./features/admin/role-users/role-user-list/role-user-list').then(
            (m) => m.RoleUserList,
          ),
      },
      {
        path: 'auditoria',
        title: 'Auditoría · Solia Express',
        canActivate: [permissionGuard],
        data: { permission: 'GET /api/audits' },
        loadComponent: () =>
          import('./features/admin/audits/audit-list/audit-list').then(
            (m) => m.AuditList,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
