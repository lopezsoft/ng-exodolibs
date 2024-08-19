import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild, ViewEncapsulation,
} from '@angular/core';

import {ColumnContract, DataSourceContract, Proxy,} from './contracts';
import {ExodoPaginationComponent} from '../pagination/pagination.component';
import {GridService} from "./grid.service";
import {ModeType} from "./model/types-model";
import {DataRecords, JsonResponse} from "./contracts/data-source";
import {Subject} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'exodo-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./../../assets/exodogrid-style.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExodoGridComponent implements OnInit, AfterViewInit {
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
  public isLoading: boolean;
  protected queryParams: any = {};
  protected isAfterViewInit: boolean;
  private afterRefreshLoadCallbacks: ((dataRecords: DataRecords) => void)[] = [];
  private _uuid = '';
  private _dataRecords: DataRecords;
  private searchSubject = new Subject<string>();
  @ViewChild('pagination') pagination: ExodoPaginationComponent;
  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('tableGrid') tableGrid: ElementRef<HTMLTableElement>;
  // Properties
  @Input() mode: ModeType = 'local';
  @Input() caption = '';
  @Input() minChar = 1;
  @Input() showPagination = false;
  @Input() showSummary = false;
  @Input() bordered = false;
  @Input() customBody: boolean;
  @Input() customHeader: boolean;
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
    this.emptyMessage = 'Sin datos';
    this.placeholder = 'Búsqueda';
    this.minChar = 1;
    this.mode = 'remote';
    this.showSummary = false;
    this.showPagination = true;
    this.uuid = this.gridService.getUniqueId('exodo-grid-');
    this.customBody = false;
    this.isAfterViewInit = false;
    this.searchSubject.pipe(
      debounceTime(300) // Retrasa la búsqueda
    ).subscribe({
      next: (query) => {
        this.searchQuery(query);
      }
    });
  }
  ngAfterViewInit(): void {
    this.searchField.nativeElement.id = this.gridService.getUniqueId('exodo-grid-search-');
    setTimeout(() => {
      this.isAfterViewInit = true;
    });
  }
  ngOnInit(): void {
    // implementar
  }
  canData(): boolean {
    if(!this.dataSource || !this.dataSource?.rows) {
      return false;
    }
    return ((this.dataSource.rows.length > 0))
  }
  onLoad(params: any = {}, force = true): void {
    const me = this;
    if (!me.proxy || !me.proxy?.api?.read) { return; }
    me.queryParams = params;
    if (force) {
      me.onRefreshLoad(params);
    }
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
          me.isLoading    = false;
          me.dataRecords  = response.dataRecords;
          this.afterRefreshLoadCallbacks.forEach(callback => callback(response.dataRecords));
        },
        error: (error) => {
          me.isLoading  = false;
          console.error(error);
        }
      })
  }
  set dataRecords(dataRecords: DataRecords) {
    const me  = this;
    me._dataRecords           = dataRecords;
    me.dataSource.dataRecords = dataRecords;
    me.dataSource.rows        = me.dataSource.dataRecords.data;
    me.rows                   = me.dataSource.rows;
    me.setPagination(dataRecords);
    if (this.searchField.nativeElement) {
      this.searchField.nativeElement.focus();
    }
  }
  get dataRecords(): DataRecords {
    return this._dataRecords;
  }
  protected setPagination(dataRecords: DataRecords): void {
    const me  = this;
    if (me.showPagination && dataRecords) {
      me.pagination.onLoad({
        currentPage : dataRecords.current_page,
        from        : dataRecords.from,
        lastPage    : dataRecords.last_page,
        to          : dataRecords.to,
        total       : dataRecords.total,
        perPage     : dataRecords.per_page
      });
    }
  }
  inputSearch(e: Event) {
    const ele = <HTMLInputElement> e.target;
    if(this.mode  === 'remote') {
      if(ele.value.length === 0 || ele.value.length >= this.minChar) {
        // this.searchQuery(ele.value);
        this.searchSubject.next(ele.value);
      }
    }else {
      const table = this.tableGrid.nativeElement.tBodies[0];
      this.gridService.filterItems(ele.value, table);
    }
  }
  public onAfterRefreshLoad(callback: (dataRecords: DataRecords) => void) {
    this.afterRefreshLoadCallbacks.push(callback);
  }
  public getDataSource(): DataSourceContract {
    return this.dataSource;
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
  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }
}
