import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, catchError, finalize, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthSession } from '../../../core/services/auth-session';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authSession = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();

    this.authSession.login(payload).pipe(
      switchMap(() => this.router.navigateByUrl(this.getReturnUrl())),
      catchError((error: unknown) => {
        this.authSession.clear();

        if (
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          this.errorMessage.set(
            'Credenciales incorrectas o sesión no válida.',
          );
        } else {
          this.errorMessage.set(
            'No fue posible iniciar sesión. Comprueba la conexión con el servidor.',
          );
        }

        return EMPTY;
      }),
      finalize(() => this.loading.set(false)),
    ).subscribe();
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl &&
      returnUrl.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      returnUrl !== '/iniciar-sesion' &&
      !returnUrl.startsWith('/iniciar-sesion?') &&
      !returnUrl.startsWith('/iniciar-sesion#')
    ) {
      return returnUrl;
    }

    return '/';
  }
}
