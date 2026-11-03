import {
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { CommitteeDecision, CommitteeDecisionPayload } from '../../../core/models/committee-decision.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { toNumber } from '../../../core/models/api.model';

@Component({
  host: { class: 'block' },
  selector: 'app-committee-decision-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './committee-decision-form.html',
})
export class CommitteeDecisionForm {
  readonly decision = input<CommitteeDecision | null>(null);
  readonly applications = input<CreditApplication[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<CommitteeDecisionPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly decisionOptions = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Aprobada', value: 'approved' },
    { label: 'Rechazada', value: 'rejected' },
    { label: 'Observada', value: 'observed' },
  ];

  readonly form = this.fb.group({
    credit_application_id: [0, [
      Validators.required,
      Validators.min(1),
    ]],
    decision: ['pending' as CommitteeDecision['decision'], [
      Validators.required,
    ]],
    decision_date: [null as Date | null],
    comments: ['', [
      Validators.maxLength(2000),
    ]],
  });

  constructor() {
    effect(() => {
      const current = this.decision();
      this.resetKey();

      this.form.reset({
        credit_application_id: current?.credit_application_id ?? 0,
        decision: current?.decision ?? 'pending',
        decision_date: current?.decision_date
          ? new Date(current.decision_date)
          : null,
        comments: current?.comments ?? '',
      });
    });
  }

  applicationLabel(application: CreditApplication): string {
    const amount = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(toNumber(application.amount));

    return `Solicitud #${application.id} · ${amount}`;
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      credit_application_id: value.credit_application_id!,
      decision: value.decision!,
      decision_date: value.decision_date
        ? [
            value.decision_date.getFullYear(),
            String(value.decision_date.getMonth() + 1).padStart(2, '0'),
            String(value.decision_date.getDate()).padStart(2, '0'),
          ].join('-')
        : null,
      comments: value.comments?.trim() || null,
    });
  }
}
