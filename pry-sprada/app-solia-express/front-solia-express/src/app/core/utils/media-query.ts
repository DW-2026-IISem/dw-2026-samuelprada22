import { DestroyRef, inject, signal } from '@angular/core';

export function watchMediaQuery(query: string) {
  const matches = signal(false);
  const destroyRef = inject(DestroyRef);

  if (typeof window === 'undefined') {
    return matches.asReadonly();
  }

  const mediaQuery = window.matchMedia(query);
  matches.set(mediaQuery.matches);

  const onChange = (event: MediaQueryListEvent) => {
    matches.set(event.matches);
  };

  mediaQuery.addEventListener('change', onChange);
  destroyRef.onDestroy(() => {
    mediaQuery.removeEventListener('change', onChange);
  });

  return matches.asReadonly();
}
