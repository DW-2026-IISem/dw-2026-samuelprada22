import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Credit, CreditPayload, UpdateCreditPayload } from '../../core/models/credit.model';

@Injectable({ providedIn: 'root' })
export class CreditApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/credits`;

  list(): Observable<Credit[]> {
    return this.http.get<{ credits: Credit[] }>(this.base)
      .pipe(map((response) => response.credits));
  }

  get(id: number): Observable<Credit> {
    return this.http.get<{ credit: Credit }>(`${this.base}/${id}`)
      .pipe(map((response) => response.credit));
  }

  create(payload: CreditPayload): Observable<Credit> {
    return this.http.post<{ credit: Credit }>(this.base, payload)
      .pipe(map((response) => response.credit));
  }

  update(id: number, payload: Partial<UpdateCreditPayload>): Observable<Credit> {
    return this.http.patch<{ credit: Credit }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.credit));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
