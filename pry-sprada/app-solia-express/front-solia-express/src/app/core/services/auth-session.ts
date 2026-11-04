import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthApi } from '../../features/auth/auth-api';
import {
  AccessPayload,
  AuthUser,
  EffectivePermission,
  LoginPayload,
  SessionTokens,
} from '../models/auth.model';
import { Role } from '../models/role.model';
import { Resource } from '../models/resource.model';

const STORAGE_KEY = 'solia.session.v1';

interface PersistedSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  permissions: EffectivePermission[];
}

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly authApi = inject(AuthApi);

  readonly authEnabled = environment.requireAuth;

  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _permissions = signal<EffectivePermission[]>([]);

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly permissions = this._permissions.asReadonly();

  readonly isAuthenticated = computed(
    () => this._accessToken() !== null && this._user() !== null,
  );

  readonly roleNames = computed(() =>
    [...new Set(
      this._permissions().map((permission) => permission.role_name),
    )].sort(),
  );

  readonly roles = computed<Role[]>(() => {
    const byId = new Map<number, Role>();

    for (const permission of this._permissions()) {
      if (!byId.has(permission.role_id)) {
        byId.set(permission.role_id, {
          id: permission.role_id,
          name: permission.role_name,
          description: null,
          status: 'active',
        });
      }
    }

    return [...byId.values()];
  });

  readonly resources = computed<Resource[]>(() =>
    this._permissions().map((permission) => ({
      id: permission.resource_id,
      method: permission.method as Resource['method'],
      path: permission.path,
      description: permission.description,
      status: 'active',
    })),
  );

  readonly permissionsIndex = computed(
    () => new Set(
      this._permissions().map(
        (permission) => `${permission.method} ${permission.path}`,
      ),
    ),
  );

  readonly permissionCount = computed(
    () => this._permissions().length,
  );

  private refreshRequest: Observable<SessionTokens> | null = null;

  constructor() {
    this.restore();
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  hasSession(): boolean {
    return this._accessToken() !== null;
  }

  login(payload: LoginPayload): Observable<AccessPayload> {
    return this.authApi.login(payload).pipe(
      tap((tokens) => this.setTokens(tokens)),
      switchMap(() => this.me()),
      catchError((error: unknown) => {
        this.clear();
        return throwError(() => error);
      }),
    );
  }

  me(): Observable<AccessPayload> {
    return forkJoin({
      user: this.authApi.profile(),
      permissions: this.authApi.permissions(),
    }).pipe(
      tap((access) => this.setAccess(access)),
    );
  }

  setTokens(tokens: SessionTokens): void {
    this._accessToken.set(tokens.access_token);
    this._refreshToken.set(tokens.refresh_token);
    this.persist();
  }

  setAccess(access: AccessPayload): void {
    this._user.set(access.user);
    this._permissions.set(access.permissions ?? []);
    this.persist();
  }

  refresh(): Observable<SessionTokens> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }

    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(
        () => new Error('No existe un refresh token'),
      );
    }

    const request = this.authApi
      .refresh({ refresh_token: refreshToken })
      .pipe(
        tap((tokens) => this.setTokens(tokens)),
        catchError((error: unknown) => {
          this.clear();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.refreshRequest = request;
    return request;
  }

  ensureAccessToken(): Observable<string> {
    const accessToken = this.getAccessToken();

    const tokenRequest = accessToken
      ? of(accessToken)
      : this.refresh().pipe(
          map((tokens) => tokens.access_token),
        );

    if (!accessToken && !this.getRefreshToken()) {
      return throwError(
        () => new Error('No existe una sesión activa'),
      );
    }

    return tokenRequest.pipe(
      switchMap((token) =>
        this._user()
          ? of(token)
          : this.me().pipe(map(() => token)),
      ),
      catchError((error: unknown) => {
        this.clear();
        return throwError(() => error);
      }),
    );
  }

  can(method: string, path: string): boolean {
    if (!this.authEnabled) {
      return true;
    }

    const verb = method.toUpperCase();
    const requestPath = path.split('?')[0];

    return this._permissions().some(
      (permission) =>
        permission.method.toUpperCase() === verb &&
        this.pathMatches(permission.path, requestPath),
    );
  }

  canPermission(permission: string): boolean {
    if (!this.authEnabled) {
      return true;
    }

    const separator = permission.indexOf(' ');

    if (separator < 0) {
      return false;
    }

    return this.can(
      permission.slice(0, separator),
      permission.slice(separator + 1),
    );
  }

  hasRole(name: string): boolean {
    const normalizedName = name.trim().toLocaleLowerCase();

    return this.roleNames().some(
      (role) => role.trim().toLocaleLowerCase() === normalizedName,
    );
  }

  logout(): Observable<unknown> {
    const refreshToken = this.getRefreshToken();

    this.clear();

    if (!refreshToken) {
      return of(null);
    }

    return this.authApi.logout({
      refresh_token: refreshToken,
    }).pipe(
      catchError(() => of(null)),
    );
  }

  clear(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this._permissions.set([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // El estado en memoria también queda limpio.
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return;
      }

      const data = JSON.parse(raw) as PersistedSession;

      if (
        typeof data.accessToken !== 'string' ||
        typeof data.refreshToken !== 'string' ||
        !Array.isArray(data.permissions)
      ) {
        this.clear();
        return;
      }

      this._accessToken.set(data.accessToken || null);
      this._refreshToken.set(data.refreshToken || null);
      this._user.set(data.user ?? null);
      this._permissions.set(data.permissions);
    } catch {
      this.clear();
    }
  }

  private persist(): void {
    const data: PersistedSession = {
      accessToken: this._accessToken() ?? '',
      refreshToken: this._refreshToken() ?? '',
      user: this._user(),
      permissions: this._permissions(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // La sesión continúa en memoria si el almacenamiento no está disponible.
    }
  }

  private pathMatches(pattern: string, path: string): boolean {
    const escaped = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\/:[^/]+/g, '/[^/]+');

    return new RegExp(`^${escaped}$`).test(path);
  }
}
