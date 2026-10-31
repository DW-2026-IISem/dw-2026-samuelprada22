import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Installment, InstallmentPayload, UpdateInstallmentPayload } from '../../core/models/installment.model';

@Injectable({ providedIn: 'root' })
export class InstallmentApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/installments`;

  list(): Observable<Installment[]> {
    return this.http.get<{ installments: Installment[] }>(this.base)
      .pipe(map((response) => response.installments));
  }

  get(id: number): Observable<Installment> {
    return this.http.get<{ installment: Installment }>(`${this.base}/${id}`)
      .pipe(map((response) => response.installment));
  }

  create(payload: InstallmentPayload): Observable<Installment> {
    return this.http.post<{ installment: Installment }>(this.base, payload)
      .pipe(map((response) => response.installment));
  }

  update(id: number, payload: Partial<UpdateInstallmentPayload>): Observable<Installment> {
    return this.http.patch<{ installment: Installment }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.installment));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
