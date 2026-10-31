import {
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import {
  Member,
  MemberPayload,
} from '../../../core/models/member.model';

/**
 * Formulario reutilizable para crear y editar socios.
 *
 * No llama a la API. Recibe el socio mediante input() y emite el payload
 * con output(). El componente padre coordina las operaciones del CRUD.
 */
@Component({
  host: { class: 'block' },
  selector: 'app-member-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './member-form.html',
  styleUrl: './member-form.css',
})
export class MemberForm {
  /** Socio que se va a editar; null significa creación. */
  readonly member = input<Member | null>(null);

  /** Permite reiniciar el formulario al abrir el diálogo. */
  readonly resetKey = input(0);

  /** Indica si el padre está procesando el guardado. */
  readonly saving = input(false);

  readonly saved = output<MemberPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly activeOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const current = this.member();

      // Se lee intencionalmente para reiniciar al reabrir el diálogo.
      this.resetKey();

      this.form.reset({
        name: current?.name ?? '',
        description: current?.description ?? '',
        isActive: current?.isActive ?? true,
      });

      // El estado se modifica desde la operación de desactivación,
      // no desde el formulario de edición.
      if (current) {
        this.form.controls.isActive.disable();
      } else {
        this.form.controls.isActive.enable();
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const payload: MemberPayload = {
      name: value.name.trim(),
      description: value.description.trim() || null,
    };

    // El estado solo se envía al crear un socio.
    this.saved.emit(
      this.member()
        ? payload
        : { ...payload, isActive: value.isActive },
    );
  }
}
