import { inject } from '@angular/core';
import {
  CanActivateChildFn,
  Router,
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession } from '../services/auth-session';

export const authGuard: CanActivateChildFn = (_route, state) => {
  if (!environment.requireAuth) {
    return true;
  }

  const session = inject(AuthSession);
  const router = inject(Router);

  return session.ensureAccessToken().pipe(
    map(() => true),
    catchError(() =>
      of(
        router.createUrlTree(['/iniciar-sesion'], {
          queryParams: { returnUrl: state.url },
        }),
      ),
    ),
  );
};
