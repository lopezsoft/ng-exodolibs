import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectivesModule } from './directives.module';

@Component({
  template: `
    <div class="exodo-theme-dark">
      <button type="button" [exodoTooltip]="text" [tooltipDirection]="direction">Acción</button>
    </div>
  `,
  standalone: false
})
class TestTooltipHostComponent {
  text: string | number | null = 'Ayuda contextual';
  direction?: 'left' | 'right';
}

describe('ExodoTooltipDirective', () => {
  let fixture: ComponentFixture<TestTooltipHostComponent>;
  let host: TestTooltipHostComponent;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectivesModule],
      declarations: [TestTooltipHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestTooltipHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelectorAll('.exodo-tooltip').forEach((el) => el.remove());
  });

  it('should create tooltip on mouseenter with fixed position, ARIA role and ancestor theme class', () => {
    button.dispatchEvent(new MouseEvent('mouseenter'));

    const tooltip = document.body.querySelector('.exodo-tooltip') as HTMLElement;
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toBe('Ayuda contextual');
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.style.position).toBe('fixed');
    expect(tooltip.classList.contains('exodo-theme-dark')).toBeTrue();
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('should render tooltip text safely without interpreting HTML', () => {
    host.text = '<img src=x onerror="window.__tooltipXss=1">';
    fixture.detectChanges();

    button.dispatchEvent(new MouseEvent('mouseenter'));
    const tooltip = document.body.querySelector('.exodo-tooltip') as HTMLElement;
    expect(tooltip.querySelector('img')).toBeNull();
    expect(tooltip.textContent).toContain('<img');
    expect((window as any).__tooltipXss).toBeUndefined();
  });

  it('should support numeric 0 as tooltip text', () => {
    host.text = 0;
    fixture.detectChanges();

    button.dispatchEvent(new MouseEvent('mouseenter'));
    const tooltip = document.body.querySelector('.exodo-tooltip') as HTMLElement;
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toBe('0');
  });

  it('should update tooltip text dynamically on input change and destroy when emptied', () => {
    button.dispatchEvent(new MouseEvent('mouseenter'));
    let tooltip = document.body.querySelector('.exodo-tooltip') as HTMLElement;
    expect(tooltip.textContent).toBe('Ayuda contextual');

    host.text = 'Nuevo texto';
    fixture.detectChanges();
    expect(tooltip.textContent).toBe('Nuevo texto');

    host.text = '';
    fixture.detectChanges();
    tooltip = document.body.querySelector('.exodo-tooltip') as HTMLElement;
    expect(tooltip).toBeNull();
  });

  it('should dismiss tooltip on mouseleave, Escape key and ngOnDestroy (no DOM leak)', () => {
    button.dispatchEvent(new FocusEvent('focusin'));
    expect(document.body.querySelectorAll('.exodo-tooltip').length).toBe(1);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.body.querySelectorAll('.exodo-tooltip').length).toBe(0);

    button.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.body.querySelectorAll('.exodo-tooltip').length).toBe(1);

    fixture.destroy();
    expect(document.body.querySelectorAll('.exodo-tooltip').length).toBe(0);
  });
});
