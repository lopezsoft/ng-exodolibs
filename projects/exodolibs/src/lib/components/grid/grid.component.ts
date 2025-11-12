import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
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
export class ExodoGridComponent implements OnInit, OnChanges, AfterViewInit {
  public emptyMessage = 'Sin datos';
  public rows: any = [];
  public isLoading: boolean;
  /** Parámetros variables: búsqueda, filtros, ordenamiento, paginación */
  protected queryParams: any = {};
  /** Parámetros base inmutables que deben persistir en todas las operaciones */
  protected baseParams: any = {};
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
  /** Filas de encabezado calculadas para soportar encabezados agrupados */
  public headerRows: ColumnContract[][] = [];
  /** Columnas hoja que se usan para renderizar celdas (sin children) */
  public leafColumns: ColumnContract[] = [];
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
    this.proxy = {
      api: { 
        read: '',
        create: '',
        update: '',
        destroy: ''
      }
    }
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
      // Reconstruir headers después de inicializar la vista (por si las columnas vienen dinámicas)
      this.rebuildHeaders();
      if (this.mode === 'remote') {
        this.onLoad(this.baseParams);
      }
    });
  }
  ngOnInit(): void {
    // Construir encabezados iniciales
    this.rebuildHeaders();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en columnas o dataSource y reconstruir el grid
    if (changes['columns'] || changes['dataSource']) {
      if (changes['columns'] && changes['columns'].currentValue) {
        this.rebuildGrid();
      }
      if (changes['dataSource'] && changes['dataSource'].currentValue) {
        this.refreshDataRows();
      }
    }
  }
  canData(): boolean {
    if(!this.dataSource || !this.dataSource?.rows) {
      return false;
    }
    return ((this.dataSource.rows.length > 0))
  }
  onLoad(params: any = {}, force = true): void {
    if (!this.proxy || !this.proxy?.api?.read) { return; }
    // Guardar los parámetros base inmutables
    this.baseParams = { ...params };
    // Inicializar queryParams vacío (solo tendrá parámetros variables)
    this.queryParams = {};
    if (force) {
      this.onRefreshLoad(this.queryParams);
    }
  }
  inputKey(event: any): void {
    if (!this.isLoading && this.mode === 'remote') {
      const ele = <HTMLInputElement> event.target;
      const searchString  = ele.value;
      if (event.keyCode === 13 && searchString.length >= 0) {
        this.searchQuery(searchString);
      }
    }
  }
  searchQuery(searchQuery: string): void {
    if (this.mode !== 'remote') { return; }
    // Limpiar parámetros de búsqueda
    delete this.queryParams.query;
    delete this.queryParams.search;
    delete this.queryParams.searchQuery;
    delete this.queryParams.searchParam;
    
    // Actualizar solo los parámetros variables en queryParams
    if (searchQuery && searchQuery.length > 0) {
      this.queryParams.query = searchQuery;
      this.queryParams.search = searchQuery;
      this.queryParams.searchQuery = searchQuery;
      this.queryParams.searchParam = searchQuery;
    }
    
    // Resetear paginación
    this.queryParams.page = 1;
    if (this.limit != null) {
      this.queryParams.limit = this.limit;
      this.queryParams.skip = 0;
    }
    
    this.onRefreshLoad(this.queryParams);
  }

  public onRefreshPagination(page: number): void {
    // Actualizar solo la paginación en queryParams
    this.queryParams.page = page;
    if (this.limit != null) {
      this.queryParams.limit = this.limit;
      this.queryParams.skip = (Number(page) - 1) * Number(this.limit);
    } else if (this.skip != null) {
      this.queryParams.skip = this.skip;
    }

    this.onRefreshLoad(this.queryParams);
  }
  private onRefreshLoad(params: any) {
    if (this.isLoading || this.mode !== 'remote') {
      return;
    }
    const url     = this.proxy.api.read;
    this.isLoading  = true;
    if(!params) {
      params = {};
    }
    // Asegurar que siempre incluimos limit/skip en la petición cuando estén disponibles
    const requestParams = { ...params, ...this.baseParams};
    if (this.limit != null && requestParams.limit == null) { requestParams.limit = this.limit; }
    if (this.skip != null && requestParams.skip == null) { requestParams.skip = this.skip; }
    this.gridService.onRefreshLoad(url, requestParams)
      .subscribe({
        next: (response: any) => {
          this.isLoading    = false;
          const jsonResponse = this.dataAdapter ? this.dataAdapter(response, params) : response;
          this.dataRecords  = jsonResponse.dataRecords;
          this.afterRefreshLoadCallbacks.forEach(callback => callback(jsonResponse.dataRecords));
        },
        error: (error) => {
          this.isLoading  = false;
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
        // Al iniciar búsqueda, resetear solo la paginación pero mantener otros parámetros
        // NO resetear queryParams aquí, lo hará searchQuery con el debounce
        this.searchSubject.next(ele.value);
      }
    }else {
      const table = this.tableGrid.nativeElement.tBodies[0];
      this.gridService.filterItems(ele.value, table);
    }
  }

  applyGridFilter(event: any) {
    // Agregar/actualizar filtros en queryParams
    Object.assign(this.queryParams, event);
    
    // Resetear paginación
    this.queryParams.page = 1;
    if (this.limit != null) { 
      this.queryParams.limit = this.limit; 
      this.queryParams.skip = 0; 
    } else if (this.skip != null) { 
      this.queryParams.skip = 0; 
    }
    
    this.onRefreshLoad(this.queryParams);
  }

  sort(column: ColumnContract) {
    // validar si la columna es ordenable (propiedad de columna puede deshabilitarlo)
    if (!this.allowSorting || !column.dataIndex || column.sortable === false) {
      return;
    }

    if (this.sortColumn === column.dataIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.dataIndex;
      this.sortDirection = 'asc';
    }

    if (this.mode === 'remote') {
      // Actualizar ordenamiento en queryParams
      this.queryParams.sort = this.sortColumn;
      this.queryParams.dir = this.sortDirection;
      
      // Resetear paginación
      this.queryParams.page = 1;
      if (this.limit != null) { 
        this.queryParams.limit = this.limit; 
        this.queryParams.skip = 0; 
      } else if (this.skip != null) { 
        this.queryParams.skip = 0; 
      }
      
      // Combinar baseParams + queryParams para la petición
      this.onRefreshLoad(this.queryParams);
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

  /** Reconstruye las filas de encabezado y la lista de columnas hoja */
  protected rebuildHeaders(): void {
    if (!this.columns || this.columns.length === 0) {
      this.headerRows = [];
      this.leafColumns = [];
      return;
    }
    this.headerRows = this.buildHeaderRows(this.columns);
    this.leafColumns = this.collectLeafColumns(this.columns);
  }

  /**
   * Método público para reconstruir completamente el grid.
   * Útil cuando las columnas cambian dinámicamente o después de refresh del navegador.
   */
  public rebuildGrid(): void {
    // Reconstruir headers y columnas
    this.rebuildHeaders();
    // Refrescar datos si existen
    this.refreshDataRows();
    // Forzar detección de cambios si estamos en AfterViewInit
    if (this.isAfterViewInit && this.mode === 'remote' && this.proxy) {
      // Si hay proxy configurado y estamos en modo remoto, recargar datos
      this.onLoad(this.baseParams, true);
    }
  }

  /**
   * Método auxiliar para refrescar las filas de datos desde dataSource
   */
  private refreshDataRows(): void {
    if (this.dataSource && this.dataSource.rows) {
      this.rows = this.dataSource.rows;
      if (this.dataSource.dataRecords) {
        this.setPagination(this.dataSource.dataRecords);
      }
    } else {
      this.rows = [];
    }
  }

  /** Construye una matriz de filas de encabezado a partir de columnas (soporta children) */
  protected buildHeaderRows(columns: ColumnContract[]): ColumnContract[][] {
    const rows: ColumnContract[][] = [];
    const traverse = (cols: ColumnContract[], level = 0) => {
      rows[level] = rows[level] || [];
      cols.forEach(col => {
        rows[level].push(col);
        if (col.children && col.children.length > 0) {
          traverse(col.children, level + 1);
          if (!col.colspan) { col.colspan = this.countLeafColumns(col); }
        }
      });
    };
    traverse(columns, 0);
    const maxLevel = rows.length;
    for (let r = 0; r < rows.length; r++) {
      rows[r].forEach(col => {
        if (!col.children || col.children.length === 0) {
          if (!col.rowspan) { col.rowspan = maxLevel - r; }
        }
      });
    }
    return rows;
  }

  protected countLeafColumns(col: ColumnContract): number {
    if (!col.children || col.children.length === 0) { return 1; }
    return col.children.reduce((acc, c) => acc + this.countLeafColumns(c), 0);
  }

  protected collectLeafColumns(columns: ColumnContract[]): ColumnContract[] {
    const leaves: ColumnContract[] = [];
    const traverse = (cols: ColumnContract[]) => {
      cols.forEach(c => {
        if (c.children && c.children.length > 0) { traverse(c.children); }
        else { leaves.push(c); }
      });
    };
    traverse(columns);
    return leaves;
  }

  public onAfterRefreshLoad(callback: (dataRecords: DataRecords) => void) {
    this.afterRefreshLoadCallbacks.push(callback);
  }
  
  /**
   * Limpia todos los parámetros variables (búsqueda, filtros, ordenamiento)
   * pero mantiene los parámetros base inmutables
   */
  public clearFilters(): void {
    this.queryParams = {};
    if (this.searchField && this.searchField.nativeElement) {
      this.searchField.nativeElement.value = '';
    }
    this.sortColumn = null;
    this.sortDirection = 'asc';
    
    this.onRefreshLoad(this.queryParams);
  }
  
  /**
   * Obtiene los parámetros base inmutables (los que se pasaron en onLoad)
   */
  public getBaseParams(): any {
    return { ...this.baseParams };
  }
  
  /**
   * Obtiene todos los parámetros actuales (base + variables)
   */
  public getQueryParams(): any {
    return { ...this.baseParams, ...this.queryParams };
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
