import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EffectivePermission,
  LoginPayload,
  ProfileResponse,
  RefreshTokenPayload,
  SessionTokens,
  AuthUser,
} from '../../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sesion`;

  login(payload: LoginPayload): Observable<SessionTokens> {
    return this.http.post<SessionTokens>(`${this.base}/login`, payload);
  }

  refresh(payload: RefreshTokenPayload): Observable<SessionTokens> {
    return this.http.post<SessionTokens>(`${this.base}/refresh`, payload);
  }

  logout(payload: RefreshTokenPayload): Observable<unknown> {
    return this.http.post(`${this.base}/logout`, payload);
  }

  profile(): Observable<AuthUser> {
    return this.http.get<ProfileResponse>(`${this.base}/perfil`)
      .pipe(map((response) => response.user));
  }

  permissions(): Observable<EffectivePermission[]> {
    return this.http
      .get<{ permissions: EffectivePermission[] }>(`${environment.apiUrl}/permisos`)
      .pipe(map((response) => response.permissions));
  }

}
