import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Audit } from '../../../core/models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/audits`;

  list(): Observable<Audit[]> {
    return this.http.get<{ audits: Audit[] }>(this.base)
      .pipe(map((response) => response.audits));
  }

  get(id: number): Observable<Audit> {
    return this.http.get<{ audit: Audit }>(`${this.base}/${id}`)
      .pipe(map((response) => response.audit));
  }

  create(payload: Omit<Audit, 'id' | 'createdAt'>): Observable<Audit> {
    return this.http.post<{ audit: Audit }>(this.base, payload)
      .pipe(map((response) => response.audit));
  }
}
