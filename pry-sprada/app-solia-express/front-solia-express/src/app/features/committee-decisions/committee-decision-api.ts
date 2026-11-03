import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CommitteeDecision,
  CommitteeDecisionPayload,
  UpdateCommitteeDecisionPayload,
} from '../../core/models/committee-decision.model';

@Injectable({ providedIn: 'root' })
export class CommitteeDecisionApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/committee-decisions`;

  list(): Observable<CommitteeDecision[]> {
    return this.http
      .get<{ committee_decisions: CommitteeDecision[] }>(this.base)
      .pipe(map((response) => response.committee_decisions));
  }

  get(id: number): Observable<CommitteeDecision> {
    return this.http
      .get<{ committee_decision: CommitteeDecision }>(`${this.base}/${id}`)
      .pipe(map((response) => response.committee_decision));
  }

  create(payload: CommitteeDecisionPayload): Observable<CommitteeDecision> {
    return this.http
      .post<{ committee_decision: CommitteeDecision }>(this.base, payload)
      .pipe(map((response) => response.committee_decision));
  }

  update(
    id: number,
    payload: UpdateCommitteeDecisionPayload,
  ): Observable<CommitteeDecision> {
    return this.http
      .patch<{ committee_decision: CommitteeDecision }>(
        `${this.base}/${id}`,
        payload,
      )
      .pipe(map((response) => response.committee_decision));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }
}
