import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
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
  @Input() proxy: Proxy;
  @Input() placeholder = 'Búsqueda';
  @Input() allowFiltering = false;
  @Input() allowSorting = false;
  /** Número de items por página (limit). Si se provee, se enviará como `limit` en las peticiones remotas. */
  @Input() limit: number = 15;
  /** Offset inicial (skip) — se calculará automáticamente a partir de `page` y `limit` si no se provee. */
  @Input() skip: number = 0;
  @Input() dataAdapter: (response: any, params: any) => JsonResponse;
  @Input() labels: { [key: string]: string } = {};
  /** Theme name applied to the grid host. Expected values: 'light'|'modern'|'dark' or custom */
  @Input() theme: string = 'glacial';

  public sortColumn: string;
  public sortDirection: 'asc' | 'desc' = 'asc';

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

  // Bind host classes based on the `theme` input so the grid styles are scoped per-instance
  @HostBinding('class.exodo-theme-modern') get hostModern() { return this.theme === 'modern'; }
  @HostBinding('class.exodo-theme-dark') get hostDark() { return this.theme === 'dark'; }
  @HostBinding('class.exodo-theme-glacial') get hostGlacial() { return this.theme === 'glacial'; }
  @HostBinding('class.exodo-theme-sky') get hostSky() { return this.theme === 'sky'; }
  @HostBinding('class.exodo-theme-bone') get hostBone() { return this.theme === 'bone'; }
  @HostBinding('class.exodo-theme-gray') get hostGray() { return this.theme === 'gray'; }


  // Accept theme via input — simple setter kept for API clarity
  @Input()
  set themeInput(value: string | null) {
    this.theme = value;
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isAfterViewInit = true;
      if (this.searchField && this.searchField.nativeElement) {
        this.searchField.nativeElement.id = this.gridService.getUniqueId('exodo-grid-search-');
      }
      if (this.mode === 'remote') {
        this.onLoad();
      }
    });
  }
  ngOnInit(): void {
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
    const params      = {
      ...this.queryParams, 
      query: searchQuery, 
      search: searchQuery,
      searchQuery: searchQuery, 
      searchParam: searchQuery
    };
    this.queryParams  = params;
    this.onRefreshLoad(params);
  }

  public onRefreshPagination(page: number): void {
    // cuando se cambia la página, calcular skip si hay limit
    const params: any = { ...this.queryParams, page };
    if (this.limit != null) {
      params.limit = this.limit;
      params.skip = (Number(page) - 1) * Number(this.limit);
    } else if (this.skip != null) {
      // si existe skip configurado externamente, preferirlo
      params.skip = this.skip;
    }
    this.queryParams = params;
    this.onRefreshLoad(params);
  }
  private onRefreshLoad(params: any) {
    const me  = this;
    if (me.isLoading || me.mode !== 'remote') {
      return;
    }
    const url     = me.proxy.api.read;
    me.isLoading  = true;
    // Asegurar que siempre incluimos limit/skip en la petición cuando estén disponibles
    const requestParams = { ...params };
    if (this.limit != null && requestParams.limit == null) { requestParams.limit = this.limit; }
    if (this.skip != null && requestParams.skip == null) { requestParams.skip = this.skip; }
    me.gridService.onRefreshLoad(url, requestParams)
      .subscribe({
        next: (response: any) => {
          me.isLoading    = false;
          const jsonResponse = me.dataAdapter ? me.dataAdapter(response, params) : response;
          me.dataRecords  = jsonResponse.dataRecords;
          this.afterRefreshLoadCallbacks.forEach(callback => callback(jsonResponse.dataRecords));
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
        // resetear paginación al buscar
        this.queryParams = { ...this.queryParams, page: 1 };
        if (this.limit != null) {
          this.queryParams.limit = this.limit;
          this.queryParams.skip = 0;
        } else if (this.skip != null) {
          this.queryParams.skip = 0;
        }
        this.searchSubject.next(ele.value);
      }
    }else {
      const table = this.tableGrid.nativeElement.tBodies[0];
      this.gridService.filterItems(ele.value, table);
    }
  }

  applyGridFilter(event: any) {
    // Al aplicar filtros, reiniciamos la paginación (page -> 1, skip -> 0) y preservamos limit si existe
    const params: any = { ...this.queryParams, ...event, page: 1 };
    if (this.limit != null) { params.limit = this.limit; params.skip = 0; }
    else if (this.skip != null) { params.skip = 0; }
    this.queryParams = params;
    this.onRefreshLoad(params);
  }

  sort(column: ColumnContract) {
    if (!this.allowSorting || !column.dataIndex) {
      return;
    }

    if (this.sortColumn === column.dataIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.dataIndex;
      this.sortDirection = 'asc';
    }

    if (this.mode === 'remote') {
      const params: any = { ...this.queryParams, sort: this.sortColumn, dir: this.sortDirection, page: 1 };
      // ordenar debe resetear la paginación para evitar inconsistencias
      if (this.limit != null) { params.limit = this.limit; params.skip = 0; }
      else if (this.skip != null) { params.skip = 0; }
      this.queryParams = params;
      this.onRefreshLoad(params);
    } else {
      this.dataSource.rows.sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        if (valA < valB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
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
