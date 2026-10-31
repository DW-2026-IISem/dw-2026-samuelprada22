import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly menuRequested = output<void>();
}
