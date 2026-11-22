import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GridCellComponent } from './grid-cell.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { DirectivesModule } from '../../../directives/directives.module';
import { ColumnContract } from '../contracts';

describe('GridCellComponent', () => {
  let component: GridCellComponent;
  let fixture: ComponentFixture<GridCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, PipesModule, DirectivesModule],
      declarations: [GridCellComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GridCellComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    delete (window as any).__xss;
  });

  it('should escape plain values when no cellRender is provided', () => {
    const column: ColumnContract = { text: 'Nombre', dataIndex: 'name' };
    const row = { name: '<b>x</b>' };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    component.rowIndex = 0;
    component.columnIndex = 0;

    expect(component.getCellValue(column, 0, 0)).toBe('&lt;b&gt;x&lt;/b&gt;');
  });

  it('should prevent XSS in plain cells (no img element created and no script execution)', () => {
    const column: ColumnContract = { text: 'Nombre', dataIndex: 'name' };
    const row = { name: '<img src=x onerror="window.__xss=1">' };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    component.rowIndex = 0;
    component.columnIndex = 0;
    fixture.detectChanges();

    const cellEl = fixture.nativeElement.querySelector('.grid-cell') as HTMLElement;
    expect(cellEl.querySelector('img')).toBeNull();
    expect(cellEl.textContent).toContain('<img src=x onerror="window.__xss=1">');
    expect((window as any).__xss).toBeUndefined();
  });

  it('should sanitize unquoted attribute XSS inside cellRender', () => {
    const column: ColumnContract = {
      text: 'Avatar',
      dataIndex: 'name',
      cellRender: (r: any) => `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt=${r.name}>`
    };
    const row = { name: 'x onerror=window.__xss=1' };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    component.rowIndex = 0;
    component.columnIndex = 0;
    fixture.detectChanges();

    const imgEl = fixture.nativeElement.querySelector('.grid-cell img') as HTMLImageElement | null;
    expect(imgEl?.getAttribute('onerror')).toBeNull();
    expect((window as any).__xss).toBeUndefined();
  });

  it('should format currency columns and handle null/NaN/invalid locale safely', () => {
    const column: ColumnContract = {
      text: 'Total',
      dataIndex: 'amount',
      type: 'currency',
      format: 'en-US',
      currency: 'USD'
    };
    const row = { amount: 1250.5 };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    expect(component.getCellValue(column, 0, 0)).toContain('1,250.50');

    expect(component.getCurrencyFormat(column, null)).toBe('');
    expect(component.getCurrencyFormat(column, 'invalid')).toBe('invalid');

    const badCol: ColumnContract = { ...column, currency: 'INVALID_CURR' };
    expect(component.getCurrencyFormat(badCol, 100)).toBe('100');
  });

  it('should enter edit mode with default clicksToEdit, bind HTML length attrs and revert on Escape', () => {
    const column: ColumnContract = {
      text: 'Nombre',
      dataIndex: 'name',
      editing: true,
      minLength: 2,
      maxLength: 20
    };
    const row = { name: 'Original' };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    component.rowIndex = 0;
    component.columnIndex = 0;
    fixture.detectChanges();

    component.cellClick(new MouseEvent('click'), column, row, 0, 0);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute('minlength')).toBe('2');
    expect(input.getAttribute('maxlength')).toBe('20');

    row.name = 'Modificado';
    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(row.name).toBe('Original');
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('should disable boolean checkbox when column.editing is explicitly false', async () => {
    const column: ColumnContract = {
      text: 'Activo',
      dataIndex: 'active',
      type: 'boolean',
      editing: false
    };
    const row = { active: true };
    component.column = column;
    component.row = row;
    component.dataSource = { rows: [row] };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.disabled).toBeTrue();
  });
});
