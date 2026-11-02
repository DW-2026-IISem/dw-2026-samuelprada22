import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import {
  Credit,
  CreditPayload,
} from '../../../core/models/credit.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Rate } from '../../../core/models/rate.model';
import { toNumber } from '../../../core/models/api.model';

import { CreditApi } from '../credit-api';
import { CreditApplicationApi } from '../../credit-applications/credit-application-api';
import { RateApi } from '../../rates/rate-api';

interface SelectOption {
  label: string;
  value: number;
}

@Component({
  host: { class: 'block' },
  selector: 'app-credit-form',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './credit-form.html',
  styleUrl: './credit-form.css',
})
export class CreditForm {
  readonly credit = input<Credit | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<CreditPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly creditApi = inject(CreditApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly rateApi = inject(RateApi);

  private readonly sourceApplications = signal<CreditApplication[]>([]);
  private readonly sourceCredits = signal<Credit[]>([]);
  private readonly requestedRateIds = new Set<number>();

  readonly applications = signal<SelectOption[]>([]);
  readonly rates = signal<Rate[]>([]);

  readonly applicationsLoading = signal(false);
  readonly ratesLoading = signal(false);

  readonly applicationsError = signal(false);
  readonly ratesError = signal(false);

  readonly form = this.fb.group({
    credit_application_id: [0, [Validators.required, Validators.min(1)]],
    rate_id: [0, [Validators.required, Validators.min(1)]],
    date: [new Date(), [Validators.required]],
    approved_amount: [0, [Validators.required, Validators.min(0.01)]],
    term: [1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9]\d*$/),
    ]],
    interest_rate: [0, [Validators.required, Validators.min(0)]],
    observations: [''],
  });

  constructor() {
    this.loadApplications();
    this.loadRates();

    this.form.controls.rate_id.valueChanges.subscribe((rateId) => {
      const selectedRate = this.rates().find((rate) => rate.id === rateId);

      if (selectedRate) {
        this.form.controls.interest_rate.setValue(
          toNumber(selectedRate.percentage),
        );
      }
    });

    effect(() => {
      const current = this.credit();
      this.resetKey();

      this.form.reset(
        {
          credit_application_id: current?.credit_application_id ?? 0,
          rate_id: current?.rate_id ?? 0,
          date: current?.date ? new Date(current.date) : new Date(),
          approved_amount: current ? toNumber(current.approved_amount) : 0,
          term: current?.term ?? 1,
          interest_rate: current ? toNumber(current.interest_rate) : 0,
          observations: current?.observations ?? '',
        },
        { emitEvent: false },
      );
    });

    effect(() => {
      const current = this.credit();
      const applications = this.sourceApplications();
      const credits = this.sourceCredits();

      const available = applications.filter((application) => {
        const alreadyHasCredit = credits.some(
          (credit) =>
            credit.credit_application_id === application.id &&
            credit.id !== current?.id,
        );

        return (
          (application.status === 'approved' && !alreadyHasCredit) ||
          application.id === current?.credit_application_id
        );
      });

      this.applications.set(
        available.map((application) => ({
          label: this.applicationLabel(application),
          value: application.id,
        })),
      );
    });

    effect(() => {
      const current = this.credit();
      const rates = this.rates();
      const loading = this.ratesLoading();
      const failed = this.ratesError();

      if (
        current &&
        !loading &&
        !failed &&
        !rates.some((rate) => rate.id === current.rate_id) &&
        !this.requestedRateIds.has(current.rate_id)
      ) {
        this.requestedRateIds.add(current.rate_id);
        this.loadCurrentRate(current.rate_id);
      }
    });
  }

  private loadApplications(): void {
    this.applicationsLoading.set(true);
    this.applicationsError.set(false);

    forkJoin({
      applications: this.applicationApi.list(),
      credits: this.creditApi.list(),
    }).subscribe({
      next: ({ applications, credits }) => {
        this.sourceApplications.set(applications);
        this.sourceCredits.set(credits);
        this.applicationsLoading.set(false);
      },
      error: () => {
        this.sourceApplications.set([]);
        this.sourceCredits.set([]);
        this.applicationsError.set(true);
        this.applicationsLoading.set(false);
      },
    });
  }

  private loadRates(): void {
    this.ratesLoading.set(true);
    this.ratesError.set(false);

    this.rateApi.list().subscribe({
      next: (rates) => {
        this.rates.set(rates);
        this.ratesLoading.set(false);
      },
      error: () => {
        this.ratesError.set(true);
        this.ratesLoading.set(false);
      },
    });
  }

  private loadCurrentRate(rateId: number): void {
    this.rateApi.get(rateId).subscribe({
      next: (rate) => {
        this.rates.update((rates) => [
          ...rates.filter((item) => item.id !== rate.id),
          rate,
        ]);
      },
      error: () => {
        this.ratesError.set(true);
      },
    });
  }

  private applicationLabel(application: CreditApplication): string {
    return `Solicitud #${application.id} — $${toNumber(application.amount).toLocaleString('es-CO')}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      credit_application_id: value.credit_application_id,
      rate_id: value.rate_id,
      date: value.date.toISOString(),
      approved_amount: value.approved_amount,
      term: value.term,
      interest_rate: value.interest_rate,
      observations: value.observations.trim() || null,
    });
  }
}
