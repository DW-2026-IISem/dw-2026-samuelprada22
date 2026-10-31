import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Resource, ResourcePayload, UpdateResourcePayload } from '../../../core/models/resource.model';

@Injectable({ providedIn: 'root' })
export class ResourceApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recursos`;

  list(): Observable<Resource[]> {
    return this.http.get<{ resources: Resource[] }>(this.base)
      .pipe(map((response) => response.resources));
  }

  get(id: number): Observable<Resource> {
    return this.http.get<{ resource: Resource }>(`${this.base}/${id}`)
      .pipe(map((response) => response.resource));
  }

  create(payload: ResourcePayload): Observable<Resource> {
    return this.http.post<{ resource: Resource }>(this.base, payload)
      .pipe(map((response) => response.resource));
  }

  update(id: number, payload: Partial<UpdateResourcePayload>): Observable<Resource> {
    return this.http.patch<{ resource: Resource }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.resource));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
