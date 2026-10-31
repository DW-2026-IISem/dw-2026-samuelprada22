import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Status } from '../../../core/models/api.model';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  host: { class: 'inline-block' },
  imports: [TagModule],
  templateUrl: './status-tag.html',
  styleUrl: './status-tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTag {
  readonly status = input.required<Status>();

  readonly label = computed(() =>
    this.status() === 'active' ? 'Activo' : 'Inactivo',
  );

  readonly severity = computed<'success' | 'danger'>(() =>
    this.status() === 'active' ? 'success' : 'danger',
  );
}
