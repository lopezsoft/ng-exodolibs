import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild} from '@angular/core';

import {
  ColumnContract,
  DataSourceContract,
} from './contracts';
import { ExodoPaginationComponent } from '../pagination/pagination.component';
import {GridService} from "./grid.service";
import {ModeType} from "./model/types-model";
@Component({
  selector: 'exodo-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class ExodoGridComponent implements OnInit, AfterViewInit, OnChanges {
  public emptyMessage: string;
  @ViewChild('pagination') pagination: ExodoPaginationComponent;
  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('tableGrid') tableGrid: ElementRef<HTMLTableElement>;
  // Properties
  @Input() mode: ModeType;
  @Input() caption: string;
  @Input() minChar: number;
  @Input() showPagination: boolean;
  @Input() showSummary: boolean;
  @Input() bordered: boolean;
  @Input() customBody: boolean;
  @Input() headers: ColumnContract[] = [];
  @Input() columns: ColumnContract[] = [];
  @Input() dataSource: DataSourceContract = {
    rows: [],
    dataRecords: null
  };
  @Input() placeholder: string;
  constructor(
      public gridService: GridService,
  ) {
    this.emptyMessage = 'Sin datos';
    this.placeholder  = 'Búsqueda';
    this.minChar      = 3;
    this.mode         = 'local';
  }
  ngAfterViewInit(): void {
    this.gridService.searchField    = this.searchField;
    this.gridService.pagination     = this.pagination;
    this.gridService.showPagination = this.showPagination;
    this.gridService.rows           = this.dataSource.rows;
    this.gridService.tableGrid      = this.tableGrid;
  }
  ngOnInit(): void {

  }
  canData(): boolean {
    return ((this.columns.length > 0) && (this.dataSource?.rows?.length > 0))
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.gridService.dataSource     = this.dataSource;
    this.gridService.showPagination = this.showPagination;
    this.gridService.rows           = this.dataSource.rows;
  }

  inputSearch(e: Event) {
    const ele = <HTMLInputElement> e.target;
    if(ele.value.length === 0 || ele.value.length >= this.minChar) {
      if(this.mode  === 'remote') {
        this.gridService.searchQuery();
      }else {
        this.gridService.filterItems(ele.value);
      }
    }
  }
}
