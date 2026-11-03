import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { Rate, RatePayload } from '../../../core/models/rate.model';
import { NotificationService } from '../../../core/services/notification';
import { RateList } from './rate-list';

const BASE = `${environment.apiUrl}/rates`;

const RATES: Rate[] = [
  {
    id: 1,
    name: 'Tasa mensual ordinaria',
    percentage: '2.50',
    type: 'monthly',
    description: 'Tasa para créditos ordinarios',
    status: 'active',
  },
  {
    id: 2,
    name: 'Tasa anual especial',
    percentage: 8,
    type: 'annual',
    description: 'Tasa para créditos especiales',
    status: 'inactive',
  },
];

describe('RateList', () => {
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
      imports: [RateList],
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
    try {
      http.verify({ ignoreCancelled: true });
    } finally {
      TestBed.resetTestingModule();
    }
  });

  async function createList() {
    const fixture = TestBed.createComponent(RateList);

    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadData(rates: Rate[] = RATES) {
    http.expectOne(BASE).flush({ rates });
  }

  it('should load rates from the API', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadData();

    expect(list.rows()).toEqual(RATES);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();
  });

  it('should show an error when rates cannot be loaded', async () => {
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
      'No se pudieron cargar las tasas',
    );
  });

  it('should filter rates by id, name, percentage, description and type', async () => {
    const { list } = await createList();

    loadData();

    list.filter.set('1');
    expect(list.visibleRows()).toEqual([RATES[0]]);

    list.filter.set('anual');
    expect(list.visibleRows()).toEqual([RATES[1]]);

    list.filter.set('2.50');
    expect(list.visibleRows()).toEqual([RATES[0]]);

    list.filter.set('especiales');
    expect(list.visibleRows()).toEqual([RATES[1]]);

    list.filter.set('mensual');
    expect(list.visibleRows()).toEqual([RATES[0]]);
  });

  it('should translate rate types into Spanish labels', async () => {
    const { list } = await createList();

    expect(list.typeLabel('monthly')).toBe('Mensual');
    expect(list.typeLabel('annual')).toBe('Anual');

    loadData([]);
  });

  it('should format percentages using Colombian number formatting', async () => {
    const { list } = await createList();

    expect(list.formatPercentage(2.5)).toBe('2,5%');
    expect(list.formatPercentage('12.00')).toBe('12%');
    expect(list.formatPercentage('999.99')).toBe('999,99%');

    loadData([]);
  });

  it('should open the create dialog', async () => {
    const { list } = await createList();

    loadData();

    list.openCreate();

    expect(list.title()).toBe('Nueva tasa');
    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(true);
    expect(list.resetKey()).toBe(1);

    http.expectNone(BASE);
  });

  it('should POST a new rate', async () => {
    const { list } = await createList();

    loadData();

    const payload: RatePayload = {
      name: 'Tasa mensual ordinaria',
      percentage: 2.5,
      type: 'monthly',
      description: 'Tasa para créditos ordinarios',
    };

    list.openCreate();
    list.save(payload);

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      rate: {
        id: 3,
        ...payload,
        status: 'active',
      },
    });

    expect(list.saving()).toBe(false);
    expect(list.dialogVisible()).toBe(false);

    expect(notifications.success).toHaveBeenCalledWith(
      'Tasa registrada',
    );

    loadData([...RATES, {
      id: 3,
      ...payload,
      description: payload.description ?? null,
      status: 'active',
    }]);
  });

  it('should PATCH an edited rate without changing its status', async () => {
    const { list } = await createList();

    loadData();

    const payload: RatePayload = {
      name: 'Tasa mensual actualizada',
      percentage: 3,
      type: 'monthly',
      description: 'Tasa actualizada',
    };

    list.openEdit(RATES[0]);

    expect(list.title()).toBe('Editar tasa');
    expect(list.editing()).toEqual(RATES[0]);

    list.save(payload);

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      name: payload.name,
      percentage: payload.percentage,
      type: payload.type,
      description: payload.description,
    });

    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      rate: {
        ...RATES[0],
        ...payload,
      },
    });

    expect(list.saving()).toBe(false);
    expect(list.dialogVisible()).toBe(false);

    expect(notifications.success).toHaveBeenCalledWith(
      'Tasa actualizada',
    );

    loadData([
      {
        ...RATES[0],
        ...payload,
      },
      RATES[1],
    ]);
  });

  it('should show an error when saving a rate fails', async () => {
    const { list } = await createList();

    loadData();

    list.openCreate();

    list.save({
      name: 'Tasa de prueba',
      percentage: 2,
      type: 'monthly',
      description: null,
    });

    http.expectOne(BASE).flush(
      { message: 'Creation failed' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo guardar la tasa',
      expect.any(String),
    );
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { list } = await createList();

    loadData();

    list.deactivate(RATES[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation).toBeTruthy();
    expect(pendingConfirmation.header).toBe('Desactivar tasa');

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Rate deactivated',
      rate: {
        ...RATES[0],
        status: 'inactive',
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Tasa desactivada',
    );

    loadData([
      {
        ...RATES[0],
        status: 'inactive',
      },
      RATES[1],
    ]);
  });

  it('should not request deactivation for an inactive rate', async () => {
    const { list } = await createList();

    loadData();

    list.deactivate(RATES[1]);

    expect(confirmationService.confirm).not.toHaveBeenCalled();
    http.expectNone(`${BASE}/2/deactivate`);
  });
});
