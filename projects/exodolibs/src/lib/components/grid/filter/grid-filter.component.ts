import { Component, EventEmitter, Inject, Input, Optional, Output } from '@angular/core';
import { ColumnContract as Column } from '../contracts/column-contract';
import { DEFAULT_EXODO_I18N, EXODO_I18N, ExodoI18n } from '../../../i18n';

@Component({
  selector: 'lib-grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss'],
  standalone: false
})
export class GridFilterComponent {
  @Input() column!: Column;
  @Output() onFilter = new EventEmitter<{ field: string; value: string }>();

  filterValue: any = '';

  constructor(@Optional() @Inject(EXODO_I18N) private i18n?: ExodoI18n) {}

  get placeholder(): string {
    const prefix = this.i18n?.filterBy || DEFAULT_EXODO_I18N.filterBy || 'Filtrar por';
    const label = this.column?.text ?? '';
    return label ? `${prefix} ${label}` : prefix;
  }

  applyFilter(): void {
    if (!this.column?.dataIndex) {
      return;
    }
    this.onFilter.emit({
      field: this.column.dataIndex,
      value: this.filterValue === null || this.filterValue === undefined ? '' : String(this.filterValue)
    });
  }

  /** Restablece el valor visual del filtro (invocado desde ExodoGridComponent.clearFilters). */
  reset(): void {
    this.filterValue = '';
  }
}
