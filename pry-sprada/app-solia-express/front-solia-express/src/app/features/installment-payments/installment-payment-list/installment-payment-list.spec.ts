import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InstallmentPayment,
  InstallmentPaymentPayload,
} from '../../../core/models/installment-payment.model';
import { NotificationService } from '../../../core/services/notification';
import { InstallmentApi } from '../../installments/installment-api';
import { InstallmentPaymentApi } from '../installment-payment-api';
import { InstallmentPaymentList } from './installment-payment-list';

const PAYMENT: InstallmentPayment = {
  id: 1,
  installment_id: 10,
  payment_date: '2026-11-01',
  amount: 150000,
  reference: 'TRF-001',
  method: 'transfer',
  status: 'active',
};

const SECOND_PAYMENT: InstallmentPayment = {
  id: 2,
  installment_id: 11,
  payment_date: '2026-11-02',
  amount: 200000,
  reference: 'CASH-002',
  method: 'cash',
  status: 'active',
};

const CANCELLED_PAYMENT: InstallmentPayment = {
  id: 3,
  installment_id: 12,
  payment_date: '2026-11-02',
  amount: 50000,
  reference: 'CANCEL-003',
  method: 'cash',
  status: 'cancelled',
};

describe('InstallmentPaymentList', () => {
  let fixture: ComponentFixture<InstallmentPaymentList>;
  let component: InstallmentPaymentList;

  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  let installmentApi: {
    list: ReturnType<typeof vi.fn>;
  };

  let notify: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    api = {
      list: vi.fn().mockReturnValue(
        of([PAYMENT, SECOND_PAYMENT, CANCELLED_PAYMENT]),
      ),
      create: vi.fn().mockReturnValue(of(PAYMENT)),
      update: vi.fn().mockReturnValue(of(PAYMENT)),
    };

    installmentApi = {
      list: vi.fn().mockReturnValue(of([])),
    };

    notify = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [InstallmentPaymentList],
      providers: [
        { provide: InstallmentPaymentApi, useValue: api },
        { provide: InstallmentApi, useValue: installmentApi },
        { provide: NotificationService, useValue: notify },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallmentPaymentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load active and cancelled payments', () => {
    expect(component).toBeTruthy();
    expect(api.list).toHaveBeenCalledOnce();
    expect(component.rows()).toEqual([
      PAYMENT,
      SECOND_PAYMENT,
      CANCELLED_PAYMENT,
    ]);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should show an error when payments cannot be loaded', () => {
    api.list.mockReturnValue(
      throwError(() => ({ status: 500, message: 'Server error' })),
    );

    component.load();

    expect(component.rows()).toEqual([]);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeTruthy();
  });

  it('should filter payments by their fields', () => {
    component.filter.set('TRF-001');

    expect(component.visibleRows()).toEqual([PAYMENT]);

    component.filter.set('CASH-002');

    expect(component.visibleRows()).toEqual([SECOND_PAYMENT]);
  });

  it('should open the create dialog without an editing payment', () => {
    component.openCreate();

    expect(component.editing()).toBeNull();
    expect(component.dialogVisible()).toBe(true);
    expect(component.resetKey()).toBe(1);
    expect(component.title()).toBe('Registrar pago');
  });

  it('should open the edit dialog with the selected payment', () => {
    component.openEdit(PAYMENT);

    expect(component.editing()).toEqual(PAYMENT);
    expect(component.dialogVisible()).toBe(true);
    expect(component.resetKey()).toBe(1);
    expect(component.title()).toBe('Editar pago');
  });

  it('should not open the edit dialog for a cancelled payment', () => {
    component.openEdit(CANCELLED_PAYMENT);

    expect(component.editing()).toBeNull();
    expect(component.dialogVisible()).toBe(false);
    expect(component.resetKey()).toBe(0);
  });

  it('should register a payment and reload the list', () => {
    const payload: InstallmentPaymentPayload = {
      installment_id: 10,
      payment_date: '2026-11-03',
      amount: 175000,
      reference: 'NEW-003',
      method: 'deposit',
    };

    component.openCreate();
    component.save(payload);

    expect(api.create).toHaveBeenCalledWith(payload);
    expect(api.update).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);
    expect(component.dialogVisible()).toBe(false);
    expect(api.list).toHaveBeenCalledTimes(2);
    expect(notify.success).toHaveBeenCalledWith('Pago registrado');
  });

  it('should update only the editable payment fields', () => {
    component.openEdit(PAYMENT);

    component.save({
      installment_id: 10,
      payment_date: '2026-11-04',
      amount: 150000,
      reference: 'UPDATED-001',
      method: 'cash',
    });

    expect(api.update).toHaveBeenCalledWith(1, {
      payment_date: '2026-11-04',
      reference: 'UPDATED-001',
      method: 'cash',
    });

    expect(api.create).not.toHaveBeenCalled();
    expect(component.saving()).toBe(false);
    expect(component.dialogVisible()).toBe(false);
    expect(notify.success).toHaveBeenCalledWith('Pago actualizado');
  });

  it('should show an error when saving a payment fails', () => {
    api.create.mockReturnValue(
      throwError(() => ({ status: 500, message: 'Server error' })),
    );

    component.openCreate();

    component.save({
      installment_id: 10,
      payment_date: '2026-11-03',
      amount: 175000,
      reference: null,
      method: 'cash',
    });

    expect(component.saving()).toBe(false);
    expect(component.dialogVisible()).toBe(true);
    expect(notify.error).toHaveBeenCalled();
  });

  it('should translate active and cancelled payment statuses', () => {
    expect(component.statusLabel('active')).toBe('Activo');
    expect(component.statusLabel('cancelled')).toBe('Cancelado');

    expect(component.statusSeverity('active')).toBe('success');
    expect(component.statusSeverity('cancelled')).toBe('secondary');
  });

  it('should format payment amounts as Colombian pesos', () => {
    expect(component.formatAmount(150000)).toContain('$');
    expect(component.formatAmount('150000')).toContain('$');
  });

  it('should translate payment methods into Spanish labels', () => {
    expect(component.methodLabel('cash')).toBe('Efectivo');
    expect(component.methodLabel('transfer')).toBe('Transferencia');
    expect(component.methodLabel('deposit')).toBe('Consignación');
    expect(component.methodLabel('other')).toBe('Otro');
  });
});
