import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { AuthSession } from '../../core/services/auth-session';
import { watchMediaQuery } from '../../core/utils/media-query';
import { Aside } from '../aside/aside';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Aside,
    Footer,
    ConfirmDialogModule,
    DrawerModule,
    ToastModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);

  readonly authSession = inject(AuthSession);

  private readonly isDesktop = watchMediaQuery('(min-width: 1024px)');

  readonly sidebarCollapsed = signal(false);
  readonly mobileOpen = signal(false);

  readonly items = computed<MenuItem[]>(() => {
    const menu: Array<{
      label: string;
      icon: string;
      routerLink: string;
      permissions: string[];
    }> = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/',
        permissions: [
          'GET /api/members',
          'GET /api/accounts',
          'GET /api/movements',
          'GET /api/credit-applications',
          'GET /api/credits',
        ],
      },
      {
        label: 'Socios',
        icon: 'pi pi-users',
        routerLink: '/socios',
        permissions: ['GET /api/members'],
      },
      {
        label: 'Cuentas',
        icon: 'pi pi-wallet',
        routerLink: '/cuentas',
        permissions: ['GET /api/accounts'],
      },
      {
        label: 'Movimientos',
        icon: 'pi pi-arrow-right-arrow-left',
        routerLink: '/movimientos',
        permissions: ['GET /api/movements'],
      },
      {
        label: 'Solicitudes de crédito',
        icon: 'pi pi-file-edit',
        routerLink: '/solicitudes-credito',
        permissions: ['GET /api/credit-applications'],
      },
      {
        label: 'Decisiones del comité',
        icon: 'pi pi-check-square',
        routerLink: '/decisiones-comite',
        permissions: ['GET /api/committee-decisions'],
      },
      {
        label: 'Créditos',
        icon: 'pi pi-money-bill',
        routerLink: '/creditos',
        permissions: ['GET /api/credits'],
      },
      {
        label: 'Cuotas',
        icon: 'pi pi-calendar',
        routerLink: '/cuotas',
        permissions: ['GET /api/installments'],
      },
      {
        label: 'Pagos de cuotas',
        icon: 'pi pi-receipt',
        routerLink: '/pagos-cuotas',
        permissions: ['GET /api/installment-payments'],
      },
      {
        label: 'Tasas',
        icon: 'pi pi-percentage',
        routerLink: '/tasas',
        permissions: ['GET /api/rates'],
      },
      {
        label: 'Auditoría',
        icon: 'pi pi-history',
        routerLink: '/auditoria',
        permissions: ['GET /api/audits'],
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-user',
        routerLink: '/admin/usuarios',
        permissions: ['GET /api/usuarios'],
      },
      {
        label: 'Roles',
        icon: 'pi pi-id-card',
        routerLink: '/admin/roles',
        permissions: ['GET /api/roles'],
      },
      {
        label: 'Recursos',
        icon: 'pi pi-shield',
        routerLink: '/admin/recursos',
        permissions: ['GET /api/recursos'],
      },
      {
        label: 'Concesiones de roles',
        icon: 'pi pi-key',
        routerLink: '/admin/concesiones-rol',
        permissions: ['GET /api/concesiones-rol'],
      },
      {
        label: 'Asignaciones de roles',
        icon: 'pi pi-user-edit',
        routerLink: '/admin/asignaciones-rol',
        permissions: ['GET /api/asignaciones-rol'],
      },
    ];

    return menu
      .filter((item) =>
        item.permissions.some((permission) =>
          this.authSession.canPermission(permission),
        ),
      )
      .map(({ label, icon, routerLink }) => ({
        label,
        icon,
        routerLink,
      }));
  });

  protected logout(): void {
    this.authSession.logout().subscribe(() => {
      void this.router.navigateByUrl('/iniciar-sesion');
    });
  }

  protected onMenuToggle(): void {
    if (this.isDesktop()) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }

    this.mobileOpen.set(true);
  }
}
