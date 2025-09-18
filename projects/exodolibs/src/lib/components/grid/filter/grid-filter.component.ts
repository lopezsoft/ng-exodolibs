import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ColumnContract as Column } from '../contracts/column-contract';

@Component({
  selector: 'lib-grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss']
})
export class GridFilterComponent implements OnInit {
  @Input() column!: Column;
  @Output() onFilter = new EventEmitter<any>();

  filterValue: any;

  constructor() { }

  ngOnInit(): void {
  }

  applyFilter() {
    this.onFilter.emit({
      field: this.column.dataIndex,
      value: this.filterValue
    });
  }
}
