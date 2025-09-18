import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExodoPaginationComponent } from './pagination.component';
import { TranslocoService } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ExodoPaginationComponent', () => {
  let component: ExodoPaginationComponent;
  let fixture: ComponentFixture<ExodoPaginationComponent>;

  beforeEach(async () => {
    const translocoMock = {
      translate: (key: string) => key
    } as unknown as TranslocoService;

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [ExodoPaginationComponent],
      providers: [
        { provide: TranslocoService, useValue: translocoMock }
      ]
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
    component.paginationOptions = { currentPage: 1, from: 1, lastPage: 5, to: 10, total: 100, perPage: 10 } as any;
    fixture.detectChanges();
    expect(component.getInfoText()).toContain('de');
  });

  it('should use custom labels.infoTemplate when provided', () => {
    component.labels = { infoTemplate: '{{from}}->{{to}}/{{total}}' } as any;
    component.paginationOptions = { currentPage: 1, from: 2, lastPage: 5, to: 20, total: 200, perPage: 10 } as any;
    fixture.detectChanges();
    expect(component.getInfoText()).toBe('2->20/200');
  });

  it('should apply theme class when theme input is set', () => {
    component.theme = 'dark';
    fixture.detectChanges();
    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.className).toContain('exodo-pagination-dark');
  });

});
