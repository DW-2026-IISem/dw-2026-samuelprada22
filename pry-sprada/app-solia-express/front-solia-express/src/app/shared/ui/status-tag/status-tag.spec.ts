import { TestBed } from '@angular/core/testing';
import { StatusTag } from './status-tag';

describe('StatusTag', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTag],
    }).compileComponents();
  });

  it('should react when the input changes to inactive', async () => {
    const fixture = TestBed.createComponent(StatusTag);

    fixture.componentRef.setInput('status', 'active');
    await fixture.whenStable();

    expect(fixture.componentInstance.label()).toBe('Activo');
    expect(fixture.componentInstance.severity()).toBe('success');

    fixture.componentRef.setInput('status', 'inactive');
    await fixture.whenStable();

    expect(fixture.componentInstance.label()).toBe('Inactivo');
    expect(fixture.componentInstance.severity()).toBe('danger');
  });
});
