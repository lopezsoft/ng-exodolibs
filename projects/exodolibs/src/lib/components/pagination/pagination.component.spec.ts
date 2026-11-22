import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExodoPaginationComponent } from './pagination.component';
import { DirectivesModule } from '../../directives/directives.module';
import { EXODO_I18N } from '../../i18n';

describe('ExodoPaginationComponent', () => {
  let component: ExodoPaginationComponent;
  let fixture: ComponentFixture<ExodoPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DirectivesModule],
      declarations: [ExodoPaginationComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExodoPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return default info text when no labels provided', () => {
    component.paginationOptions = { currentPage: 1, from: 1, lastPage: 5, to: 10, total: 100, perPage: 10 };
    fixture.detectChanges();
    expect(component.getInfoText()).toBe('1 - 10 de 100');
  });

  it('should use custom labels.infoTemplate and handle null counts safely', () => {
    component.labels = { infoTemplate: '{{from}}->{{to}}/{{total}}' };
    component.paginationOptions = { currentPage: 1, from: 2, lastPage: 5, to: 20, total: 200, perPage: 10 };
    fixture.detectChanges();
    expect(component.getInfoText()).toBe('2->20/200');

    component.paginationOptions = { currentPage: 1, from: null as any, lastPage: 0, to: null as any, total: 0, perPage: 10 };
    expect(component.getInfoText()).toBe('0->0/0');
  });

  it('should apply both legacy and theme classes without wiping consumer classes', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    hostEl.classList.add('table-responsive');

    component.theme = 'dark';
    fixture.detectChanges();

    expect(hostEl.classList.contains('table-responsive')).toBeTrue();
    expect(hostEl.classList.contains('exodo-pagination-dark')).toBeTrue();
    expect(hostEl.classList.contains('exodo-theme-dark')).toBeTrue();
  });

  it('should clamp out-of-bounds pages, reject NaN/negative values and emit strict numbers', () => {
    component.onLoad({ currentPage: 2, from: 11, lastPage: 5, to: 20, total: 50, perPage: 10 });
    fixture.detectChanges();

    const emitted: number[] = [];
    component.onRefreshPagination.subscribe((p) => emitted.push(p));

    (component as any).onNextPage('abc');
    (component as any).onNextPage('');
    (component as any).onNextPage('99');
    (component as any).onNextPage('-5');
    (component as any).onNextPage('3');

    expect(emitted).toEqual([5, 1, 3]);
    expect(emitted.every((n) => typeof n === 'number')).toBeTrue();
  });

  it('should enable First/Previous on page 2 even when perPage === 1 (from === currentPage)', () => {
    component.onLoad({ currentPage: 2, from: 2, lastPage: 5, to: 2, total: 5, perPage: 1 });
    fixture.detectChanges();

    expect(component.isFirstPage).toBeFalse();
    expect(component.isLastPage).toBeFalse();

    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].disabled).toBeFalse();
    expect(buttons[1].disabled).toBeFalse();
  });

  it('should render accessible buttons without aria-hidden or native title attributes', () => {
    component.onLoad({ currentPage: 1, from: 1, lastPage: 3, to: 10, total: 30, perPage: 10 });
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.length).toBe(5);
    for (const btn of buttons) {
      expect(btn.getAttribute('aria-hidden')).toBeNull();
      expect(btn.getAttribute('title')).toBeNull();
      expect(btn.getAttribute('aria-label')).toBeTruthy();
    }
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();
    expect(buttons[2].disabled).toBeFalse();
    expect(buttons[3].disabled).toBeFalse();
  });

  it('should respect global EXODO_I18N token with labels input taking precedence', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DirectivesModule],
      declarations: [ExodoPaginationComponent],
      providers: [
        { provide: EXODO_I18N, useValue: { first: 'First Global', next: 'Next Global' } }
      ]
    }).compileComponents();

    const customFixture = TestBed.createComponent(ExodoPaginationComponent);
    const customComp = customFixture.componentInstance;
    customComp.labels = { next: 'Next Override' };
    customFixture.detectChanges();

    expect(customComp.getLabel('first')).toBe('First Global');
    expect(customComp.getLabel('next')).toBe('Next Override');
    expect(customComp.getLabel('last')).toBe('Última página');
  });
});
