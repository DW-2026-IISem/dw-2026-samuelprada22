import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Installment } from '../../../core/models/installment.model';
import { Credit } from '../../../core/models/credit.model';

import { InstallmentApi } from '../installment-api';
import { CreditApi } from '../../credits/credit-api';
import { InstallmentDetail } from './installment-detail';

const INSTALLMENT: Installment = {
  id: 10,
  credit_id: 100,
  number: 3,
  due_date: '2026-12-15',
  principal_amount: 400000,
  interest_amount: 50000,
  total_amount: 450000,
  paid_amount: 100000,
  status: 'pending',
};

const CREDIT: Credit = {
  id: 100,
  credit_application_id: 20,
  rate_id: 5,
  date: '2026-10-01',
  approved_amount: 5000000,
  term: 12,
  interest_rate: 2.5,
  status: 'active',
  observations: 'Crédito de prueba',
};

describe('InstallmentDetail', () => {
  let installmentApi: {
    get: ReturnType<typeof vi.fn>;
  };

  let creditApi: {
    get: ReturnType<typeof vi.fn>;
  };

  let routeId: string;

  beforeEach(async () => {
    routeId = '10';

    installmentApi = {
      get: vi.fn(() => of(INSTALLMENT)),
    };

    creditApi = {
      get: vi.fn(() => of(CREDIT)),
    };

    await TestBed.configureTestingModule({
      imports: [InstallmentDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn(() => routeId),
              },
            },
          },
        },
        {
          provide: InstallmentApi,
          useValue: installmentApi,
        },
        {
          provide: CreditApi,
          useValue: creditApi,
        },
      ],
    }).compileComponents();
  });

  async function createDetail() {
    const fixture: ComponentFixture<InstallmentDetail> =
      TestBed.createComponent(InstallmentDetail);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      detail: fixture.componentInstance,
    };
  }

  it('should load the installment and its related credit', async () => {
    const { detail } = await createDetail();

    expect(installmentApi.get).toHaveBeenCalledWith(10);
    expect(creditApi.get).toHaveBeenCalledWith(INSTALLMENT.credit_id);

    expect(detail.installment()).toEqual(INSTALLMENT);
    expect(detail.credit()).toEqual(CREDIT);
    expect(detail.loading()).toBe(false);
    expect(detail.error()).toBeNull();
    expect(detail.relatedDataWarning()).toBe(false);
  });

  it('should show the installment when the related credit cannot be loaded', async () => {
    creditApi.get.mockReturnValue(
      throwError(() => new Error('Credit unavailable')),
    );

    const { fixture, detail } = await createDetail();

    expect(detail.installment()).toEqual(INSTALLMENT);
    expect(detail.credit()).toBeNull();
    expect(detail.relatedDataWarning()).toBe(true);
    expect(detail.loading()).toBe(false);

    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar los datos del crédito asociado',
    );
    expect(fixture.nativeElement.textContent).toContain(
      `Crédito #${INSTALLMENT.credit_id}`,
    );
  });

  it('should show an error when the installment cannot be loaded', async () => {
    installmentApi.get.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { detail } = await createDetail();

    expect(detail.installment()).toBeNull();
    expect(detail.credit()).toBeNull();
    expect(detail.error()).toBeTruthy();
    expect(detail.loading()).toBe(false);
    expect(creditApi.get).not.toHaveBeenCalled();
  });

  it('should reject an invalid installment identifier', async () => {
    routeId = 'invalid';

    const { detail } = await createDetail();

    expect(installmentApi.get).not.toHaveBeenCalled();
    expect(creditApi.get).not.toHaveBeenCalled();
    expect(detail.installment()).toBeNull();
    expect(detail.error()).toBe(
      'El identificador de la cuota no es válido.',
    );
    expect(detail.loading()).toBe(false);
  });

  it('should reject an identifier less than one', async () => {
    routeId = '0';

    const { detail } = await createDetail();

    expect(installmentApi.get).not.toHaveBeenCalled();
    expect(detail.error()).toBe(
      'El identificador de la cuota no es válido.',
    );
  });

  it('should return the correct label for each installment status', async () => {
    const { detail } = await createDetail();

    expect(detail.statusLabel('pending')).toBe('Pendiente');
    expect(detail.statusLabel('paid')).toBe('Pagada');
    expect(detail.statusLabel('overdue')).toBe('Vencida');
    expect(detail.statusLabel('cancelled')).toBe('Cancelada');
  });

  it('should return the correct severity for each installment status', async () => {
    const { detail } = await createDetail();

    expect(detail.statusSeverity('pending')).toBe('warn');
    expect(detail.statusSeverity('paid')).toBe('success');
    expect(detail.statusSeverity('overdue')).toBe('danger');
    expect(detail.statusSeverity('cancelled')).toBe('secondary');
  });

  it('should format monetary values as Colombian pesos', async () => {
    const { detail } = await createDetail();

    expect(detail.formatAmount(450000)).toContain('450.000');
    expect(detail.formatAmount('100000')).toContain('100.000');
    expect(detail.formatAmount(450000)).toContain('$');
  });

  it('should calculate the outstanding balance', async () => {
    const { detail } = await createDetail();

    expect(detail.balance).toBe(350000);
  });

  it('should not return a negative balance when payments exceed the total', async () => {
    installmentApi.get.mockReturnValue(
      of({
        ...INSTALLMENT,
        paid_amount: 500000,
      }),
    );

    const { detail } = await createDetail();

    expect(detail.balance).toBe(0);
  });

  it('should return zero when there is no installment', async () => {
    const { detail } = await createDetail();

    detail.installment.set(null);

    expect(detail.balance).toBe(0);
  });

  it('should render the installment and related credit information', async () => {
    const { fixture } = await createDetail();
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Cuota #3');
    expect(content).toContain('Información de la cuota');
    expect(content).toContain('Estado financiero');
    expect(content).toContain('Crédito relacionado');
    expect(content).toContain('Importe aprobado');
    expect(content).toContain('Plazo: 12 meses');
  });
});
