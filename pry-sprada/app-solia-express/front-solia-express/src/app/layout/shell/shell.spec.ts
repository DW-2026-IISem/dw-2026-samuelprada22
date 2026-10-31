import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Shell } from './shell';

describe('Shell', () => {
  const originalMatchMedia = window.matchMedia;

  async function crearShell() {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      compilado: fixture.nativeElement as HTMLElement,
    };
  }

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    TestBed.resetTestingModule();
  });

  it('should compose header, aside, main, footer and the router outlet', async () => {
    window.matchMedia = (() => ({
      matches: true,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const { compilado } = await crearShell();

    expect(compilado.querySelector('app-header')).toBeTruthy();
    expect(compilado.querySelector('aside app-aside')).toBeTruthy();
    expect(
      compilado.querySelector('main#contenido router-outlet'),
    ).toBeTruthy();
    expect(compilado.querySelector('app-footer')).toBeTruthy();
  });

  it('should open the mobile drawer from the header button', async () => {
    window.matchMedia = (() => ({
      matches: false,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const { fixture, compilado } = await crearShell();

    const boton = compilado.querySelector(
      'app-header button[aria-label="Abrir o cerrar menú"]',
    ) as HTMLButtonElement | null;

    expect(boton).toBeTruthy();
    boton!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mobileOpen()).toBe(true);
  });

  it('should hide the desktop aside when the header button is clicked', async () => {
    window.matchMedia = (() => ({
      matches: true,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    const { fixture, compilado } = await crearShell();

    expect(compilado.querySelector('aside app-aside')).toBeTruthy();

    const boton = compilado.querySelector(
      'app-header button[aria-label="Abrir o cerrar menú"]',
    ) as HTMLButtonElement | null;

    expect(boton).toBeTruthy();
    boton!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compilado.querySelector('aside app-aside')).toBeFalsy();
    expect(fixture.componentInstance.sidebarCollapsed()).toBe(true);
    expect(fixture.componentInstance.mobileOpen()).toBe(false);
  });
});
