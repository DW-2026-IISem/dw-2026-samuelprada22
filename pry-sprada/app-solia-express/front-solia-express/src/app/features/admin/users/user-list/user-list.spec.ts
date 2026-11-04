import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification';
import { UserList } from './user-list';

const BASE = `${environment.apiUrl}/usuarios`;

const USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@solia.test',
    avatar: null,
    status: 'active',
  },
  {
    id: 2,
    username: 'cajero',
    email: 'cajero@solia.test',
    avatar: null,
    status: 'inactive',
  },
];

describe('UserList', () => {
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
      imports: [UserList],
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
    const fixture = TestBed.createComponent(UserList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarUsuarios() {
    http.expectOne(BASE).flush({ users: USERS });
  }

  it('should load users from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);

    cargarUsuarios();

    expect(lista.rows()).toEqual(USERS);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
  });

  it('should show an error when users cannot be loaded', async () => {
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
      'No se pudo cargar el listado de usuarios.',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter users by their fields', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.filter.set('CAJERO');

    expect(lista.visibleRows()).toEqual([USERS[1]]);

    lista.filter.set('admin@solia.test');

    expect(lista.visibleRows()).toEqual([USERS[0]]);

    lista.filter.set('2');

    expect(lista.visibleRows()).toEqual([USERS[1]]);
  });

  it('should open the create dialog without an editing user', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.openCreate();

    expect(lista.editing()).toBeNull();
    expect(lista.dialogVisible()).toBe(true);
    expect(lista.title()).toBe('Nuevo usuario');
  });

  it('should open the edit dialog with the selected user', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.openEdit(USERS[0]);

    expect(lista.editing()).toEqual(USERS[0]);
    expect(lista.dialogVisible()).toBe(true);
    expect(lista.title()).toBe('Editar usuario');
  });

  it('should POST a new user and reload the list', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    const payload = {
      username: 'nuevo',
      email: 'nuevo@solia.test',
      password: 'Password123!',
      avatar: null,
    };

    lista.openCreate();
    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      user: {
        id: 3,
        ...payload,
        status: 'active',
      },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Usuario creado');

    http.expectOne(BASE).flush({ users: USERS });
  });

  it('should PATCH the user profile without sending password or status', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.openEdit(USERS[0]);

    const payload = {
      username: 'admin_actualizado',
      email: 'nuevo-admin@solia.test',
      avatar: null,
    };

    lista.save(payload);

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('password');
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      user: { ...USERS[0], ...payload },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Usuario actualizado',
    );

    http.expectOne(BASE).flush({ users: USERS });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.deactivate(USERS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'User deactivated' });

    expect(notifications.success).toHaveBeenCalledWith(
      'Usuario desactivado',
    );

    http.expectOne(BASE).flush({ users: [USERS[1]] });
  });

  it('should DELETE a user after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.remove(USERS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'User permanently deleted' });

    expect(notifications.success).toHaveBeenCalledWith(
      'Usuario eliminado',
    );

    http.expectOne(BASE).flush({ users: [USERS[1]] });
  });

  it('should not deactivate a user when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.deactivate(USERS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not delete a user when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarUsuarios();

    lista.remove(USERS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1`);
  });
});
