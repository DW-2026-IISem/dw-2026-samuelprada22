import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { AuthUser } from '../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly user = input<AuthUser | null>(null);
  readonly authEnabled = input(true);

  readonly menuRequested = output<void>();
  readonly logoutRequested = output<void>();
}
