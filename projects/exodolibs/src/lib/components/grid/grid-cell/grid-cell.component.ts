import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColumnContract, DataSourceContract} from "../contracts";

@Component({
  selector: 'el-grid-cell',
  templateUrl: './grid-cell.component.html'
})
export class GridCellComponent {
  protected isEditing = false;
  @Output() onChange = new EventEmitter<string>();
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;
  @Input() column: ColumnContract = null;
  @Input() dataSource: DataSourceContract = null;
  @Input() row: any;
  @Input() rowIndex = -1;
  @Input() columnIndex = -1;

  public getCssCell(column: ColumnContract): string {
    return column?.cssCell;
  }
  public getClassValue(column: ColumnContract): object {
    const style = {
      width: column.width,
      'min-width': column.minWidth,
      minlength: column.minLength,
      maxlength: column.maxLength,
      'text-align': column.align
    };
    return style;
  }
  public getCurrencyFormat(column: ColumnContract, value: string): string {
    if (column?.type === 'currency' && column.format && column.currency) {
      const options = { style: 'currency', currency: column.currency };
      const numberFormat = new Intl.NumberFormat(column.format, options);
      return numberFormat.format(parseFloat(value));
    }
    return value;
  }
  public getCellValue(column: ColumnContract, columnIndex: number, rowIndex: number ): string {
    if (this.isEditing) return "";
    const row = this.dataSource.rows[rowIndex];
    let value: string = row[column.dataIndex];
    if (column.type === 'currency') {
      value = this.getCurrencyFormat(column, value);
    }
    if (column.cellRender) {
      const valueHtml = column.cellRender(row, rowIndex, value, columnIndex);
      return valueHtml;
    }
    return value;
  }

  public cellClick(event: MouseEvent, column: ColumnContract, row: any, rowIndex: number, columnIndex?: number) {
    if (column.cellClick && !column.editing) {
      column.cellClick(row, rowIndex, columnIndex);
    } else if (column.editing && column.clicksToEdit === 1 && !this.isEditing) {
      this.onEditing();
    }
  }
  public cellDbClick(event: MouseEvent, column: ColumnContract, row: any, rowIndex: number, columnIndex?: number) {
    if (column.cellDbClick && !column.editing) {
      column.cellDbClick(row, rowIndex, columnIndex);
    } else if (column.editing && column.clicksToEdit === 2 && !this.isEditing) {
      this.onEditing();
    }
  }

  public onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.offEditing(e);
      return;
    }
  }
  public onBlur(e: FocusEvent) {
    this.offEditing(e);
  }
  private onEditing() {
    if (this.isEditing) return;
    this.isEditing  = true;
    setTimeout(() => {
      const input = this?.inputElement?.nativeElement;
      if (input) {
        input.focus();
        if (input.type == 'text') {
          input.select();
          input.selectionStart = 0;
        }
      }
    }, 20);
  }

  private offEditing(event: any) {
    if(!this.isEditing) return;
    this.isEditing = false;
  }

  protected onInputMode(): string {
    let type: string = 'text';
    switch (this.column.type) {
      case "boolean":
        type  = 'none';
        break;
      case "number":
        type = 'numeric';
        break;
      case "currency":
        type  = 'decimal';
        break;
    }
    return type;
  }

  protected onTypeInput(): string {
    let type: string = 'text';
    switch (this.column.type) {
      case "boolean":
        type  = 'checkbox';
        break;
      case "number":
        type = 'number';
        break;
      case "date":
        type  = 'date';
        break;
    }
    return type;
  }
  protected onInputChange(e: Event) {
    const ele = <HTMLInputElement> e.target;
    if (ele.type === 'checkbox') {
      this.onChange.emit(ele.checked ? '1': '0');
    } else {
      this.onChange.emit(ele.value);
    }
  }
}
