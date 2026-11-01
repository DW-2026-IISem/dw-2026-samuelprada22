import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import {
  CreditApplication,
  CreditApplicationPayload,
} from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { MemberApi } from '../../members/member-api';

@Component({
  host: { class: 'block' },
  selector: 'app-credit-application-form',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './credit-application-form.html',
  styleUrl: './credit-application-form.css',
})
export class CreditApplicationForm {
  readonly application = input<CreditApplication | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<CreditApplicationPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly memberApi = inject(MemberApi);

  readonly members = signal<Member[]>([]);
  readonly membersLoading = signal(false);
  readonly membersError = signal(false);

  readonly form = this.fb.group({
    member_id: [0, [Validators.required, Validators.min(1)]],
    reference_id: [null as number | null],
    date: [new Date(), [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    observations: [''],
  });

  constructor() {
    this.loadMembers();

    effect(() => {
      const current = this.application();
      this.resetKey();

      this.form.reset({
        member_id: current?.member_id ?? 0,
        reference_id: current?.reference_id ?? null,
        date: current?.date ? new Date(current.date) : new Date(),
        amount: current ? Number(current.amount) : 0,
        observations: current?.observations ?? '',
      });
    });
  }

  private loadMembers(): void {
    this.membersLoading.set(true);
    this.membersError.set(false);

    this.memberApi.list().subscribe({
      next: (members) => {
        this.members.set(members.filter((member) => member.isActive));
        this.membersLoading.set(false);
      },
      error: () => {
        this.membersError.set(true);
        this.membersLoading.set(false);
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
      member_id: value.member_id,
      reference_id: value.reference_id,
      date: value.date.toISOString(),
      amount: value.amount,
      observations: value.observations.trim() || null,
    });
  }
}
