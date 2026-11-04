import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession } from '../services/auth-session';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(AuthSession);
  const router = inject(Router);

  if (!environment.requireAuth) {
    return next(request);
  }

  const isApiRequest = request.url.startsWith(environment.apiUrl);

  const isPublicAuthRequest =
    /\/sesion\/(login|refresh|logout)(\?|$)/.test(request.url);

  if (!isApiRequest || isPublicAuthRequest) {
    return next(request);
  }

  const accessToken = session.getAccessToken();

  const authenticatedRequest = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !session.getRefreshToken()
      ) {
        return throwError(() => error);
      }

      return session.refresh().pipe(
        catchError((refreshError: unknown) => {
          session.clear();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });

          return throwError(() => refreshError);
        }),
        switchMap((tokens) => {
          const retryRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          return next(retryRequest).pipe(
            catchError((retryError: unknown) => {
              if (
                retryError instanceof HttpErrorResponse &&
                retryError.status === 401
              ) {
                session.clear();
                void router.navigate(['/login'], {
                  queryParams: { returnUrl: router.url },
                });
              }

              return throwError(() => retryError);
            }),
          );
        }),
      );
    }),
  );
};
