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
  DataSourceContract, Proxy,
} from './contracts';
import { ExodoPaginationComponent } from '../pagination/pagination.component';
import {GridService} from "./grid.service";
import {ModeType} from "./model/types-model";
import {JsonResponse} from "./contracts/data-source";
@Component({
  selector: 'exodo-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./../../assets/exodogrid-style.scss'],
})
export class ExodoGridComponent implements OnInit, AfterViewInit, OnChanges {
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }
  private _uuid = '';
  public emptyMessage = 'Sin datos';
  public proxy: Proxy = {
    api: {
      read: null,
      create: null,
      update: null,
      destroy: null,
    }
  };
  public rows: any = [];
  protected queryParams: any = {};
  public isLoading: boolean;
  @ViewChild('pagination') pagination: ExodoPaginationComponent;
  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('tableGrid') tableGrid: ElementRef<HTMLTableElement>;
  // Properties
  @Input() mode: ModeType = 'local';
  @Input() caption = '';
  @Input() minChar = 3;
  @Input() showPagination = false;
  @Input() showSummary = false;
  @Input() bordered = false;
  @Input() customBody: boolean;
  @Input() headers: ColumnContract[] = [];
  @Input() columns: ColumnContract[] = [];
  @Input() dataSource: DataSourceContract = {
    rows: [],
    dataRecords: null
  };
  @Input() placeholder = 'Búsqueda';
  constructor(
      private gridService: GridService,
  ) {
    this.emptyMessage   = 'Sin datos';
    this.placeholder    = 'Búsqueda';
    this.minChar        = 3;
    this.mode           = 'remote';
    this.showSummary    = false;
    this.showPagination = true;
    this.uuid           = this.gridService.getUniqueId('exodo-grid-');
    this.customBody     = false;
  }
  ngAfterViewInit(): void {
    this.searchField.nativeElement.id = this.gridService.getUniqueId('exodo-grid-search-');
  }
  ngOnInit(): void {
    // implementar
  }
  canData(): boolean {
    return ((this?.columns?.length > 0) && (this.dataSource?.rows?.length > 0))
  }
  ngOnChanges(changes: SimpleChanges): void {
    // implementar
  }
  onLoad(params: any = {}): void {
    const me = this;
    if (!me.proxy || !me.proxy?.api?.read) { return; }
    me.queryParams = params;
    me.onRefreshLoad(params);
  }
  inputKey(event: any): void {
    const ts  = this;
    if (!ts.isLoading && ts.mode === 'remote') {
      const ele = <HTMLInputElement> event.target;
      const searchString  = ele.value;
      if (event.keyCode === 13 && searchString.length >= 0) {
        ts.searchQuery(searchString);
      }
    }
  }
  searchQuery(searchQuery: string): void {
    if (this.mode !== 'remote') { return; }
    const params      = {...this.queryParams, query: searchQuery};
    this.queryParams  = params;
    this.onRefreshLoad(params);
  }

  public onRefreshPagination(page: number): void {
    const params  = {...this.queryParams, page};
    this.queryParams  = params;
    this.onRefreshLoad(params);
  }
  private onRefreshLoad(params: any) {
    const me  = this;
    if (me.isLoading || me.mode !== 'remote') {
      return;
    }
    const url     = me.proxy.api.read;
    me.isLoading  = true;
    me.gridService.onRefreshLoad(url, params)
      .subscribe({
        next: (response: JsonResponse) => {
          me.isLoading  = false;
          me.dataSource.dataRecords     = response.dataRecords;
          me.dataSource.rows            = me.dataSource.dataRecords.data;
          me.rows                       = me.dataSource.rows;
          if (me.showPagination) {
            me.pagination.onLoad({
              currentPage : me.dataSource.dataRecords.current_page,
              from        : me.dataSource.dataRecords.from,
              lastPage    : me.dataSource.dataRecords.last_page,
              to          : me.dataSource.dataRecords.to,
              total       : me.dataSource.dataRecords.total,
              perPage     : me.dataSource.dataRecords.per_page
            });
          }
        },
        error: (error) => {
          me.isLoading  = false;
          console.error(error);
        }
      })
  }

  inputSearch(e: Event) {
    const ele = <HTMLInputElement> e.target;
    if(this.mode  === 'remote') {
      if(ele.value.length === 0 || ele.value.length >= this.minChar) {
        this.searchQuery(ele.value);
      }
    }else {
      const table = this.tableGrid.nativeElement.tBodies[0];
      this.gridService.filterItems(ele.value, table);
    }
  }
  public getSearchFieldId(): string {
    return this.searchField.nativeElement.id;
  }
  public getSearchField(): ElementRef<HTMLInputElement> {
    return this.searchField;
  }
  public getSearchFieldValue(): string {
    return this.searchField.nativeElement.value;
  }
  public getTable(): ElementRef<HTMLTableElement> {
    return this.tableGrid;
  }
  public getTableId(): string {
    return this.tableGrid.nativeElement.id;
  }
}
