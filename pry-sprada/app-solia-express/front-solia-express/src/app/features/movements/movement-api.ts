import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movement, MovementPayload, UpdateMovementPayload } from '../../core/models/movement.model';

@Injectable({ providedIn: 'root' })
export class MovementApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/movements`;

  list(): Observable<Movement[]> {
    return this.http.get<{ movements: Movement[] }>(this.base)
      .pipe(map((response) => response.movements));
  }

  get(id: number): Observable<Movement> {
    return this.http.get<{ movement: Movement }>(`${this.base}/${id}`)
      .pipe(map((response) => response.movement));
  }

  create(payload: MovementPayload): Observable<Movement> {
    return this.http.post<{ movement: Movement }>(this.base, payload)
      .pipe(map((response) => response.movement));
  }

  update(id: number, payload: Partial<UpdateMovementPayload>): Observable<Movement> {
    return this.http.patch<{ movement: Movement }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.movement));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
