import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InstallmentPayment,
  InstallmentPaymentPayload,
  UpdateInstallmentPaymentPayload,
} from '../../core/models/installment-payment.model';

@Injectable({ providedIn: 'root' })
export class InstallmentPaymentApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/installment-payments`;

  list(): Observable<InstallmentPayment[]> {
    return this.http.get<{ installment_payments: InstallmentPayment[] }>(this.base)
      .pipe(map((response) => response.installment_payments));
  }

  get(id: number): Observable<InstallmentPayment> {
    return this.http
      .get<{ installment_payment: InstallmentPayment }>(`${this.base}/${id}`)
      .pipe(map((response) => response.installment_payment));
  }

  create(payload: InstallmentPaymentPayload): Observable<InstallmentPayment> {
    return this.http
      .post<{ installment_payment: InstallmentPayment }>(this.base, payload)
      .pipe(map((response) => response.installment_payment));
  }

  update(id: number, payload: Partial<UpdateInstallmentPaymentPayload>): Observable<InstallmentPayment> {
    return this.http
      .patch<{ installment_payment: InstallmentPayment }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.installment_payment));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
