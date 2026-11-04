
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { Resource } from '../../../../core/models/resource.model';
import { NotificationService } from '../../../../core/services/notification';
import { ResourceList } from './resource-list';

const BASE = `${environment.apiUrl}/recursos`;

const RESOURCES: Resource[] = [
  {
    id: 1,
    method: 'GET',
    path: '/api/usuarios',
    description: 'Listar usuarios',
    status: 'active',
  },
  {
    id: 2,
    method: 'POST',
    path: '/api/movements',
    description: 'Registrar movimientos',
    status: 'active',
  },
];

describe('ResourceList', () => {
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
      imports: [ResourceList],
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

  async function createList() {
    const fixture = TestBed.createComponent(ResourceList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadResources() {
    http.expectOne(BASE).flush({ resources: RESOURCES });
  }

  it('should load resources from the API', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadResources();

    expect(list.rows()).toEqual(RESOURCES);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();
  });

  it('should show an error when resources cannot be loaded', async () => {
    const { fixture, list } = await createList();

    http.expectOne(BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    fixture.detectChanges();

    expect(list.rows()).toEqual([]);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el catálogo de recursos.',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter resources by ID, method, path and description', async () => {
    const { list } = await createList();
    loadResources();

    list.filter.set('POST');
    expect(list.visibleRows()).toEqual([RESOURCES[1]]);

    list.filter.set('/api/usuarios');
    expect(list.visibleRows()).toEqual([RESOURCES[0]]);

    list.filter.set('movimientos');
    expect(list.visibleRows()).toEqual([RESOURCES[1]]);

    list.filter.set('2');
    expect(list.visibleRows()).toEqual([RESOURCES[1]]);
  });

  it('should open the create dialog without an editing resource', async () => {
    const { list } = await createList();
    loadResources();

    list.openCreate();

    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(true);
    expect(list.title()).toBe('Nuevo recurso');
  });

  it('should open the edit dialog with the selected resource', async () => {
    const { list } = await createList();
    loadResources();

    list.openEdit(RESOURCES[0]);

    expect(list.editing()).toEqual(RESOURCES[0]);
    expect(list.dialogVisible()).toBe(true);
    expect(list.title()).toBe('Editar recurso');
  });

  it('should POST a new resource and reload the list', async () => {
    const { list } = await createList();
    loadResources();

    const payload = {
      method: 'POST' as const,
      path: '/api/credits',
      description: 'Registrar créditos',
      status: 'active' as const,
    };

    list.openCreate();
    list.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      resource: {
        id: 3,
        ...payload,
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Recurso creado');

    http.expectOne(BASE).flush({ resources: RESOURCES });
  });

  it('should PATCH a resource without sending status', async () => {
    const { list } = await createList();
    loadResources();

    list.openEdit(RESOURCES[0]);

    const payload = {
      method: 'PATCH' as const,
      path: '/api/usuarios/:id',
      description: 'Actualizar usuario',
    };

    list.save(payload);

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      resource: {
        ...RESOURCES[0],
        ...payload,
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Recurso actualizado');

    http.expectOne(BASE).flush({ resources: RESOURCES });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { list } = await createList();
    loadResources();

    list.deactivate(RESOURCES[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Resource deactivated' });

    expect(notifications.success).toHaveBeenCalledWith('Recurso desactivado');

    http.expectOne(BASE).flush({ resources: [RESOURCES[1]] });
  });

  it('should DELETE a resource after confirmation is accepted', async () => {
    const { list } = await createList();
    loadResources();

    list.remove(RESOURCES[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'Resource permanently deleted' });

    expect(notifications.success).toHaveBeenCalledWith('Recurso eliminado');

    http.expectOne(BASE).flush({ resources: [RESOURCES[1]] });
  });

  it('should not deactivate a resource when confirmation is rejected', async () => {
    const { list } = await createList();
    loadResources();

    list.deactivate(RESOURCES[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not delete a resource when confirmation is rejected', async () => {
    const { list } = await createList();
    loadResources();

    list.remove(RESOURCES[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1`);
  });
});
