import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Aside {
  readonly items = input.required<MenuItem[]>();
  readonly navigated = output<void>();
}
