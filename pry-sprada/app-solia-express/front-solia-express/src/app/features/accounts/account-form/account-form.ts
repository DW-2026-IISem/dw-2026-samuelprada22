import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { Account, AccountPayload } from '../../../core/models/account.model';
import { Member } from '../../../core/models/member.model';
import { MemberApi } from '../../members/member-api';

@Component({
  host: { class: 'block' },
  selector: 'app-account-form',
  imports: [
    ReactiveFormsModule,
    MessageModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './account-form.html',
  styleUrl: './account-form.css',
})
export class AccountForm {
  readonly account = input<Account | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<AccountPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly memberApi = inject(MemberApi);

  readonly members = signal<Member[]>([]);
  readonly membersLoading = signal(false);
  readonly membersError = signal(false);

  readonly form = this.fb.group({
    member_id: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
  });

  constructor() {
    this.loadMembers();

    effect(() => {
      const current = this.account();
      this.resetKey();

      this.form.reset({
        member_id: current?.member_id ?? 0,
        name: current?.name ?? '',
        description: current?.description ?? '',
      });
    });
  }

  private loadMembers(): void {
    this.membersLoading.set(true);
    this.membersError.set(false);

    this.memberApi.list().subscribe({
      next: (members) => {
        this.members.set(members);
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
      name: value.name.trim(),
      description: value.description.trim() || null,
    });
  }
}
