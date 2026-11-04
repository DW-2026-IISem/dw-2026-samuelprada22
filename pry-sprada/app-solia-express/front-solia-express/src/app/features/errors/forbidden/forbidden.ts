import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthSession } from '../../../core/services/auth-session';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Forbidden {
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authSession.logout().subscribe(() => {
      void this.router.navigateByUrl('/iniciar-sesion');
    });
  }
}
