import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Member } from '../../core/models/member.model';
import { MemberApi } from './member-api';

const BASE = `${environment.apiUrl}/members`;

const MEMBER: Member = {
  id: 1,
  name: 'Test member',
  description: null,
  isActive: true,
};

describe('MemberApi', () => {
  let api: MemberApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(MemberApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { members } into Member[]', () => {
    let result: Member[] | undefined;

    api.list().subscribe((members) => {
      result = members;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ members: [MEMBER] });

    expect(result).toEqual([MEMBER]);
  });

  it('should use environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/members`);

    expect(request.request.method).toBe('GET');

    request.flush({ members: [] });
  });
});
