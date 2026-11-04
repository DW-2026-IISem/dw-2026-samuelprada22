import {
  ChangeDetectionStrategy,
  Component,
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

  readonly items: MenuItem[] = [
    { label: 'Inicio', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Socios', icon: 'pi pi-users', routerLink: '/members' },
    { label: 'Cuentas', icon: 'pi pi-wallet', routerLink: '/accounts' },
    {
      label: 'Movimientos',
      icon: 'pi pi-arrow-right-arrow-left',
      routerLink: '/movements',
    },
    {
      label: 'Solicitudes de crédito',
      icon: 'pi pi-file-edit',
      routerLink: '/credit-applications',
    },
    {
      label: 'Decisiones del comité',
      icon: 'pi pi-check-square',
      routerLink: '/committee-decisions',
    },
    { label: 'Créditos', icon: 'pi pi-money-bill', routerLink: '/credits' },
    {
      label: 'Cuotas',
      icon: 'pi pi-calendar',
      routerLink: '/installments',
    },
    {
      label: 'Pagos de cuotas',
      icon: 'pi pi-receipt',
      routerLink: '/installment-payments',
    },
    {
      label: 'Tasas',
      icon: 'pi pi-percentage',
      routerLink: '/rates',
    },
    { label: 'Usuarios', icon: 'pi pi-user', routerLink: '/users' },
    { label: 'Auditoría', icon: 'pi pi-history', routerLink: '/audits' },
  ];

  protected logout(): void {
    this.authSession.logout().subscribe(() => {
      void this.router.navigateByUrl('/login');
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
