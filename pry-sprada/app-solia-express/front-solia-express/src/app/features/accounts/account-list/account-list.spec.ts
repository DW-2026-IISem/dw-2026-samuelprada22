import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { Account } from '../../../core/models/account.model';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { MemberApi } from '../../members/member-api';
import { AccountList } from './account-list';

const BASE = `${environment.apiUrl}/accounts`;

const MEMBERS: Member[] = [
  {
    id: 10,
    name: 'Ana',
    description: 'Socio principal',
    isActive: true,
  },
  {
    id: 20,
    name: 'Samuel',
    description: null,
    isActive: true,
  },
];

const ACCOUNTS: Account[] = [
  {
    id: 1,
    member_id: 10,
    name: 'Ahorros',
    description: 'Cuenta principal',
    status: 'active',
  },
  {
    id: 2,
    member_id: 20,
    name: 'Aportes',
    description: null,
    status: 'active',
  },
];

describe('AccountList', () => {
  let http: HttpTestingController;
  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };
  let confirmationService: ConfirmationService;
  let pendingConfirmation: any;
  let memberApi: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    notifications = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    confirmationService = new ConfirmationService();
    pendingConfirmation = undefined;

    vi.spyOn(confirmationService, 'confirm').mockImplementation((options) => {
      pendingConfirmation = options;
      return confirmationService;
    });

    memberApi = {
      list: vi.fn(() => of(MEMBERS)),
    };

    await TestBed.configureTestingModule({
      imports: [AccountList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: notifications,
        },
        {
          provide: ConfirmationService,
          useValue: confirmationService,
        },
        {
          provide: MemberApi,
          useValue: memberApi,
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  async function crearLista() {
    const fixture = TestBed.createComponent(AccountList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarCuentas() {
    http.expectOne(BASE).flush({ accounts: ACCOUNTS });
  }

  it('should load accounts from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);

    cargarCuentas();

    expect(lista.rows()).toEqual(ACCOUNTS);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
    expect(lista.memberName(10)).toBe('Ana');
  });

  it('should show an error when accounts cannot be loaded', async () => {
    const { fixture, lista } = await crearLista();

    http.expectOne(BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    fixture.detectChanges();

    expect(lista.rows()).toEqual([]);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el listado de cuentas.',
    );
  });

  it('should use the member identifier when its name is unavailable', async () => {
    memberApi.list.mockReturnValue(of([]));

    const { lista } = await crearLista();
    cargarCuentas();

    expect(lista.memberName(10)).toBe('Socio #10');
  });

  it('should filter accounts locally without another API request', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.filter.set('SAMUEL');

    expect(lista.visibleRows()).toEqual([ACCOUNTS[1]]);

    lista.filter.set('cuenta principal');

    expect(lista.visibleRows()).toEqual([ACCOUNTS[0]]);

    lista.filter.set('2');

    expect(lista.visibleRows()).toEqual([ACCOUNTS[1]]);

    http.expectNone(BASE);
  });

  it('should POST a new account and reload the list', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    const payload = {
      member_id: 10,
      name: 'Nueva cuenta',
      description: 'Descripción',
    };

    lista.openCreate();
    expect(lista.title()).toBe('Nueva cuenta');

    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      account: { id: 3, ...payload, status: 'active' },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Cuenta creada');

    http.expectOne(BASE).flush({ accounts: [...ACCOUNTS] });
  });

  it('should PATCH an edited account without sending status', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.openEdit(ACCOUNTS[0]);
    expect(lista.title()).toBe('Editar cuenta');

    const payload = {
      member_id: 10,
      name: 'Ahorros actualizados',
      description: 'Nueva descripción',
    };

    lista.save(payload);

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      account: { ...ACCOUNTS[0], ...payload },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Cuenta actualizada',
    );

    http.expectOne(BASE).flush({ accounts: ACCOUNTS });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.deactivate(ACCOUNTS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Account deactivated',
      account: { ...ACCOUNTS[0], status: 'inactive' },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Cuenta desactivada',
    );

    http.expectOne(BASE).flush({ accounts: [ACCOUNTS[1]] });
  });

  it('should DELETE an account after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.remove(ACCOUNTS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({
      message: 'Account deleted',
      id: 1,
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Cuenta eliminada',
    );

    http.expectOne(BASE).flush({ accounts: [ACCOUNTS[1]] });
  });

  it('should not deactivate an account when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.deactivate(ACCOUNTS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not delete an account when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarCuentas();

    lista.remove(ACCOUNTS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1`);
  });
});
