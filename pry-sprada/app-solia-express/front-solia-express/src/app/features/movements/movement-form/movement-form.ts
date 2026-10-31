import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';

import { Account } from '../../../core/models/account.model';
import { Movement, MovementPayload } from '../../../core/models/movement.model';
import { AccountApi } from '../../accounts/account-api';

@Component({
  host: { class: 'block' },
  selector: 'app-movement-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    TextareaModule,
    InputTextModule,
  ],
  templateUrl: './movement-form.html',
  styleUrl: './movement-form.css',
})
export class MovementForm {
  readonly movement = input<Movement | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<MovementPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly accountApi = inject(AccountApi);

  readonly accounts = signal<Account[]>([]);
  readonly accountsLoading = signal(false);
  readonly accountsError = signal(false);

  readonly types = [
    { label: 'Crédito', value: 'credit' },
    { label: 'Débito', value: 'debit' },
  ];

  readonly form = this.fb.group({
    account_id: [0, [Validators.required, Validators.min(1)]],
    reference_id: [
      0,
      [
        (control: AbstractControl) => {
          const value = control.value;

          if (value === null || value === undefined || value === '') {
            return null;
          }

          const numericValue = Number(value);

          return Number.isFinite(numericValue) && numericValue >= 0
            ? null
            : { min: { min: 0, actual: value } };
        },
      ],
    ],
    type: ['credit', Validators.required],
    date: [this.today(), Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    observations: [''],
  });

  constructor() {
    this.loadAccounts();

    effect(() => {
      const current = this.movement();
      this.resetKey();

      this.form.reset({
        account_id: current?.account_id ?? 0,
        reference_id: current?.reference_id ?? 0,
        type: current?.type ?? 'credit',
        date: current?.date?.slice(0, 10) ?? this.today(),
        amount: current ? Number(current.amount) : 0,
        observations: current?.observations ?? '',
      });
    });
  }

  private today(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private loadAccounts(): void {
    this.accountsLoading.set(true);
    this.accountsError.set(false);

    this.accountApi.list().subscribe({
      next: (accounts) => {
        this.accounts.set(
          accounts.filter((account) => account.status === 'active'),
        );
        this.accountsLoading.set(false);
      },
      error: () => {
        this.accounts.set([]);
        this.accountsError.set(true);
        this.accountsLoading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      account_id: value.account_id,
      reference_id: value.reference_id > 0 ? value.reference_id : null,
      type: value.type,
      date: value.date,
      amount: value.amount,
      observations: value.observations.trim() || null,
    });
  }
}
