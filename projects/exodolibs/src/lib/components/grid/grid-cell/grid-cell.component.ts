import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ColumnContract, DataSourceContract } from '../contracts';
import { escapeHTML } from '../../../utils/html.utils';

@Component({
  selector: 'el-grid-cell',
  templateUrl: './grid-cell.component.html',
  styleUrls: ['../../../assets/exodostyles/grid-cell.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class GridCellComponent implements OnDestroy {
  private static readonly currencyFormatCache = new Map<string, Intl.NumberFormat>();

  protected isEditing = false;
  private originalValue: any;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  @Output() onChange = new EventEmitter<string>();
  @ViewChild('inputElement') inputElement?: ElementRef<HTMLInputElement>;
  @Input() column: ColumnContract | null = null;
  @Input() dataSource: DataSourceContract | null = null;
  @Input() row: any;
  @Input() rowIndex = -1;
  @Input() columnIndex = -1;

  ngOnDestroy(): void {
    this.clearFocusTimer();
  }

  public getCssCell(column: ColumnContract | null): string {
    return column?.cssCell ?? '';
  }

  public getClassValue(column: ColumnContract | null): Record<string, string | null | undefined> {
    if (!column) {
      return {};
    }
    return {
      width: this.normalizeDimension(column.width),
      'min-width': this.normalizeDimension(column.minWidth),
      'text-align': column.align
    };
  }

  public normalizeDimension(value?: string | number | null): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const str = String(value).trim();
    return /^\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
  }

  public getCurrencyFormat(column: ColumnContract | null, value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    if (column?.type === 'currency' && column.format && column.currency) {
      const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (!Number.isFinite(numericValue)) {
        return String(value);
      }
      const cacheKey = `${column.format}::${column.currency}`;
      try {
        let formatter = GridCellComponent.currencyFormatCache.get(cacheKey);
        if (!formatter) {
          formatter = new Intl.NumberFormat(column.format, {
            style: 'currency',
            currency: column.currency
          });
          GridCellComponent.currencyFormatCache.set(cacheKey, formatter);
        }
        return formatter.format(numericValue);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  public getTooltip(column: ColumnContract | null, row: any): string | null {
    if (!column) {
      return null;
    }
    if (column.tooltipRender) {
      return column.tooltipRender(row) ?? null;
    }
    return column.tooltip ?? null;
  }

  public getCellValue(column: ColumnContract | null, columnIndex: number, rowIndex: number): string {
    if (this.isEditing || !column) {
      return '';
    }
    const targetRow = this.row ?? this.dataSource?.rows?.[rowIndex];
    if (!targetRow) {
      return '';
    }
    let value: any = column.dataIndex != null ? targetRow[column.dataIndex] : '';
    if (column.type === 'currency') {
      value = this.getCurrencyFormat(column, value);
    }
    if (column.cellRender) {
      const rendered = column.cellRender(targetRow, rowIndex, value, columnIndex);
      return rendered === null || rendered === undefined ? '' : String(rendered);
    }
    // Escapar valores planos cuando no existe cellRender para prevenir XSS
    return escapeHTML(value);
  }

  public cellClick(event: MouseEvent, column: ColumnContract | null, row: any, rowIndex: number, columnIndex?: number): void {
    if (!column) {
      return;
    }
    const clicksToEdit = column.clicksToEdit ?? 1;
    if (column.cellClick && !column.editing) {
      column.cellClick(row, rowIndex, columnIndex);
    } else if (column.editing && clicksToEdit === 1 && !this.isEditing) {
      this.onEditing();
    }
  }

  public cellDbClick(event: MouseEvent, column: ColumnContract | null, row: any, rowIndex: number, columnIndex?: number): void {
    if (!column) {
      return;
    }
    const clicksToEdit = column.clicksToEdit ?? 1;
    if (column.cellDbClick && !column.editing) {
      column.cellDbClick(row, rowIndex, columnIndex);
    } else if (column.editing && clicksToEdit === 2 && !this.isEditing) {
      this.onEditing();
    }
  }

  public onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      // Revertir el cambio si el usuario cancela la edición con Escape
      if (this.row && this.column?.dataIndex != null) {
        this.row[this.column.dataIndex] = this.originalValue;
      }
      this.offEditing(e);
      return;
    }
    if (e.key === 'Enter') {
      this.offEditing(e);
    }
  }

  public onBlur(e: FocusEvent): void {
    this.offEditing(e);
  }

  private onEditing(): void {
    if (this.isEditing) {
      return;
    }
    if (this.row && this.column?.dataIndex != null) {
      this.originalValue = this.row[this.column.dataIndex];
    }
    this.isEditing = true;
    this.clearFocusTimer();
    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      const input = this.inputElement?.nativeElement;
      if (input) {
        input.focus();
        if (input.type === 'text') {
          input.select();
        }
      }
    }, 20);
  }

  private offEditing(_event: Event): void {
    if (!this.isEditing) {
      return;
    }
    this.clearFocusTimer();
    this.isEditing = false;
  }

  private clearFocusTimer(): void {
    if (this.focusTimer !== null) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
  }

  protected onInputMode(): string {
    switch (this.column?.type) {
      case 'boolean':
        return 'none';
      case 'number':
        return 'numeric';
      case 'currency':
        return 'decimal';
      default:
        return 'text';
    }
  }

  protected onTypeInput(): string {
    switch (this.column?.type) {
      case 'boolean':
        return 'checkbox';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  }

  protected onInputChange(e: Event): void {
    const ele = e.target as HTMLInputElement;
    if (ele.type === 'checkbox') {
      this.onChange.emit(ele.checked ? '1' : '0');
    } else {
      this.onChange.emit(ele.value);
    }
  }
}
