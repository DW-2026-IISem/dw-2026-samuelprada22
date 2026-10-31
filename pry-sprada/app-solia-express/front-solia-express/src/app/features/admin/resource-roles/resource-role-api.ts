import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ResourceRole,
  ResourceRolePayload,
} from '../../../core/models/resource-role.model';

@Injectable({ providedIn: 'root' })
export class ResourceRoleApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/concesiones-rol`;

  list(): Observable<ResourceRole[]> {
    return this.http.get<{ grants: ResourceRole[] }>(this.base)
      .pipe(map((response) => response.grants));
  }

  get(id: number): Observable<ResourceRole> {
    return this.http.get<{ grant: ResourceRole }>(`${this.base}/${id}`)
      .pipe(map((response) => response.grant));
  }

  create(payload: ResourceRolePayload): Observable<ResourceRole> {
    return this.http.post<{ grant: ResourceRole }>(this.base, payload)
      .pipe(map((response) => response.grant));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  reactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/reactivate`, {});
  }
}
