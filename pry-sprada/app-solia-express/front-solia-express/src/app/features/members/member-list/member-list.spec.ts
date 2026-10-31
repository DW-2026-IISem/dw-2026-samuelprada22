import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { MemberList } from './member-list';

const BASE = `${environment.apiUrl}/members`;

const MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Ana',
    description: 'Socio principal',
    isActive: true,
  },
  {
    id: 2,
    name: 'Samuel',
    description: null,
    isActive: true,
  },
];

describe('MemberList', () => {
  let http: HttpTestingController;
  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };
  let confirmationService: ConfirmationService;
  let pendingConfirmation: any;

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

    await TestBed.configureTestingModule({
      imports: [MemberList],
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
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  async function crearLista() {
    const fixture = TestBed.createComponent(MemberList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarSocios() {
    http.expectOne(BASE).flush({ members: MEMBERS });
  }

  it('should load members from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);

    cargarSocios();

    expect(lista.rows()).toEqual(MEMBERS);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
  });

  it('should show the loading error without displaying an empty state', async () => {
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
      'No se pudo cargar el listado de socios.',
    );
    expect(fixture.nativeElement.textContent).not.toContain(
      'No hay socios registrados',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter members locally', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.filter.set('SAMUEL');

    expect(lista.visibleRows()).toEqual([MEMBERS[1]]);
  });

  it('should POST a new member and reload the list', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    const payload = {
      name: 'Nuevo socio',
      description: 'Descripción',
      isActive: true,
    };

    lista.openCreate();
    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      member: { id: 3, ...payload },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Socio creado');

    http.expectOne(BASE).flush({ members: [...MEMBERS] });
  });

  it('should PATCH an edited member without sending isActive', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.openEdit(MEMBERS[0]);

    const payload = {
      name: 'Socio actualizado',
      description: 'Nueva descripción',
    };

    lista.save(payload);

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('isActive');

    request.flush({
      member: { ...MEMBERS[0], ...payload },
    });

    expect(notifications.success).toHaveBeenCalledWith('Socio actualizado');

    http.expectOne(BASE).flush({ members: MEMBERS });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.deactivate(MEMBERS[0]);
    expect(confirmationService.confirm).toHaveBeenCalled();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Member deactivated' });

    expect(notifications.success).toHaveBeenCalledWith('Socio desactivado');

    http.expectOne(BASE).flush({ members: [MEMBERS[1]] });
  });

  it('should DELETE a member after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.remove(MEMBERS[0]);
    expect(confirmationService.confirm).toHaveBeenCalled();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'Member deleted' });

    expect(notifications.success).toHaveBeenCalledWith('Socio eliminado');

    http.expectOne(BASE).flush({ members: [MEMBERS[1]] });
  });

  it('should not deactivate a member when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.deactivate(MEMBERS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not delete a member when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarSocios();

    lista.remove(MEMBERS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1`);
  });
});
