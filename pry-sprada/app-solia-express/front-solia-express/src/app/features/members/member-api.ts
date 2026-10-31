import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Member, MemberPayload, UpdateMemberPayload } from '../../core/models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/members`;

  list(): Observable<Member[]> {
    return this.http
      .get<{ members: Member[] }>(this.base)
      .pipe(map((response) => response.members));
  }

  get(id: number): Observable<Member> {
    return this.http
      .get<{ member: Member }>(`${this.base}/${id}`)
      .pipe(map((response) => response.member));
  }

  create(payload: MemberPayload): Observable<Member> {
    return this.http
      .post<{ member: Member }>(this.base, payload)
      .pipe(map((response) => response.member));
  }

  update(
    id: number,
    payload: Partial<UpdateMemberPayload>,
  ): Observable<Member> {
    return this.http
      .patch<{ member: Member }>(`${this.base}/${id}`, payload)
      .pipe(map((response) => response.member));
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/deactivate`, {});
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
