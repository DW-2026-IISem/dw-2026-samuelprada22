import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession } from '../services/auth-session';

export const permissionGuard: CanActivateFn = (route, state) => {
  if (!environment.requireAuth) {
    return true;
  }

  const session = inject(AuthSession);
  const router = inject(Router);

  const singlePermission = route.data['permission'] as
    | string
    | undefined;

  const multiplePermissions = route.data['permissions'] as
    | string[]
    | undefined;

  const requiredPermissions = multiplePermissions ??
    (singlePermission ? [singlePermission] : []);

  if (requiredPermissions.length === 0) {
    return false;
  }

  return session.ensureAccessToken().pipe(
    map(() => {
      const hasPermission = requiredPermissions.some((permission) =>
        session.canPermission(permission),
      );

      return hasPermission
        ? true
        : router.createUrlTree(['/acceso-denegado'], {
            queryParams: { returnUrl: state.url },
          });
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/iniciar-sesion'], {
          queryParams: { returnUrl: state.url },
        }),
      ),
    ),
  );
};
