import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreditApplication,
  CreditApplicationPayload,
  UpdateCreditApplicationPayload,
} from '../../core/models/credit-application.model';

@Injectable({ providedIn: 'root' })
export class CreditApplicationApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/credit-applications`;

  list(): Observable<CreditApplication[]> {
    return this.http.get<{ credit_applications: CreditApplication[] }>(this.base)
      .pipe(map((response) => response.credit_applications));
  }

  get(id: number): Observable<CreditApplication> {
    return this.http
      .get<{ credit_application: CreditApplication }>(`${this.base}/${id}`)
      .pipe(map((response) => response.credit_application));
  }

  create(payload: CreditApplicationPayload): Observable<CreditApplication> {
    return this.http
      .post<{ credit_application: CreditApplication }>(this.base, payload)
      .pipe(map((response) => response.credit_application));
  }

  update(id: number, payload: Partial<UpdateCreditApplicationPayload>): Observable<CreditApplication> {
    return this.http
      .patch<{ credit_application: CreditApplication }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.credit_application));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
