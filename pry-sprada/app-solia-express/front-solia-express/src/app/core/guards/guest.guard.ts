import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession } from '../services/auth-session';

export const guestGuard: CanActivateFn = () => {
  if (!environment.requireAuth) {
    return true;
  }

  const session = inject(AuthSession);
  const router = inject(Router);

  return session.ensureAccessToken().pipe(
    map(() => router.createUrlTree(['/'])),
    catchError(() => of(true)),
  );
};
