import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let add: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    add = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        {
          provide: MessageService,
          useValue: { add },
        },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should send success notifications for 3000 ms', () => {
    service.success('Saved', 'Changes saved');

    expect(add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Saved',
      detail: 'Changes saved',
      life: 3000,
    });
  });

  it('should send info notifications for 3500 ms', () => {
    service.info('Information');

    expect(add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Information',
      detail: undefined,
      life: 3500,
    });
  });

  it('should send warning notifications for 4500 ms', () => {
    service.warn('Warning', 'Check the data');

    expect(add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Check the data',
      life: 4500,
    });
  });

  it('should send error notifications for 6000 ms', () => {
    service.error('Error', 'Operation failed');

    expect(add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Operation failed',
      life: 6000,
    });
  });
});
