import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { Aside } from '../../layout/aside/aside';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

@Component({
  selector: 'app-construir',
  standalone: true,
  imports: [Header, Aside, Footer, DrawerModule],
  templateUrl: './construir.html',
  styleUrl: './construir.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Construir {
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
    { label: 'Créditos', icon: 'pi pi-money-bill', routerLink: '/credits' },
    {
      label: 'Cuotas',
      icon: 'pi pi-calendar',
      routerLink: '/installments',
    },
    { label: 'Usuarios', icon: 'pi pi-user', routerLink: '/users' },
  ];

  protected onMenuToggle(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
      return;
    }

    this.mobileOpen.set(true);
  }
}
