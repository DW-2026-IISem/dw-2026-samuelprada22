import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Account,
  AccountPayload,
  UpdateAccountPayload,
} from '../../core/models/account.model';

/** /api/accounts — la respuesta utiliza las claves accounts y account. */
@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/accounts`;

  list(): Observable<Account[]> {
    return this.http
      .get<{ accounts: Account[] }>(this.base)
      .pipe(map((response) => response.accounts));
  }

  get(id: number): Observable<Account> {
    return this.http
      .get<{ account: Account }>(`${this.base}/${id}`)
      .pipe(map((response) => response.account));
  }

  create(payload: AccountPayload): Observable<Account> {
    return this.http
      .post<{ account: Account }>(this.base, payload)
      .pipe(map((response) => response.account));
  }

  update(
    id: number,
    payload: Partial<UpdateAccountPayload>,
  ): Observable<Account> {
    return this.http
      .patch<{ account: Account }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.account));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
