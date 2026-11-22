import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { EMPTY, Subject, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ColumnContract, DataSourceContract, Proxy } from './contracts';
import { DataRecords, JsonResponse } from './contracts/data-source';
import { ExodoPaginationComponent } from '../pagination/pagination.component';
import { GridFilterComponent } from './filter/grid-filter.component';
import { GridService } from './grid.service';
import { ModeType } from './model/types-model';
import { ExodoI18n } from '../../i18n';

export interface GridCellChangeEvent {
  row: any;
  column: ColumnContract;
  rowIndex: number;
  columnIndex: number;
  value: string;
}

@Component({
  selector: 'exodo-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./../../assets/exodogrid-style.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class ExodoGridComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  public emptyMessage = 'Sin datos';
  public isLoading = false;
  /** ID estable para el campo de búsqueda, disponible desde la creación del componente. */
  public readonly searchFieldId: string;
  /** Parámetros variables: búsqueda, filtros, ordenamiento, paginación. */
  protected queryParams: Record<string, any> = {};
  /** Parámetros base inmutables que deben persistir en todas las operaciones. */
  protected baseParams: Record<string, any> = {};
  protected isAfterViewInit = false;

  private afterRefreshLoadCallbacks: Array<(dataRecords: DataRecords) => void> = [];
  private _uuid = '';
  private _dataRecords: DataRecords | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly cancelPendingSearch$ = new Subject<void>();
  private readonly loadTrigger$ = new Subject<{
    url: string;
    requestParams: Record<string, any>;
    requestId: number;
  }>();
  private activeRequestId = 0;
  private hasInitiatedLoad = false;
  private initTimer: ReturnType<typeof setTimeout> | null = null;
  private localSearchTerm = '';
  private localColumnFilters: Record<string, string> = {};

  @ViewChild('pagination') pagination?: ExodoPaginationComponent;
  @ViewChild('searchField') searchField?: ElementRef<HTMLInputElement>;
  @ViewChild('tableGrid') tableGrid?: ElementRef<HTMLTableElement>;
  @ViewChildren(GridFilterComponent) filterComponents?: QueryList<GridFilterComponent>;

  @Input() mode: ModeType = 'remote';
  @Input() caption = '';
  @Input() minChar = 1;
  @Input() showPagination = true;
  @Input() showSummary = false;
  @Input() bordered = true;
  @Input() customBody = false;
  @Input() customHeader = false;
  /** @deprecated Utilice `columns` en su lugar. */
  @Input() headers: ColumnContract[] = [];
  @Input() columns: ColumnContract[] = [];
  /** Filas de encabezado calculadas para soportar encabezados agrupados. */
  public headerRows: ColumnContract[][] = [];
  /** Columnas hoja visibles que se usan para renderizar celdas (sin children). */
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
  @Input() dataAdapter?: (response: any, params: any) => JsonResponse;
  @Input() labels: ExodoI18n | null | undefined = {};
  /** Nombre del tema aplicado al host: 'glacial' | 'dark' | 'light' | 'modern' | 'sky' | 'bone' | 'gray'. */
  @Input() theme: string | null = 'glacial';
  /** Si es `true`, devuelve el foco al campo de búsqueda tras cada carga remota (por defecto `false` para no robar foco). */
  @Input() autoFocusSearch = false;
  /** Función opcional `trackBy` para optimizar renderizado de filas. */
  @Input() trackBy?: TrackByFunction<any>;

  /** Evento emitido cuando falla una petición HTTP remota. */
  @Output() loadError = new EventEmitter<any>();
  /** Evento emitido cuando se modifica una celda editable. */
  @Output() cellChange = new EventEmitter<GridCellChangeEvent>();

  public sortColumn: string | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private gridService: GridService) {
    this.uuid = this.gridService.getUniqueId('exodo-grid-');
    this.searchFieldId = this.gridService.getUniqueId('exodo-grid-search-');
    this.proxy = {
      api: {
        read: '',
        create: '',
        update: '',
        destroy: ''
      }
    };

    // Debounce cancelable cuando el usuario presiona Enter inmediatamente
    this.searchSubject.pipe(
      switchMap((query) => timer(300).pipe(
        takeUntil(this.cancelPendingSearch$),
        map(() => query)
      )),
      takeUntil(this.destroy$)
    ).subscribe((query) => {
      this.searchQuery(query);
    });

    // Flujo de carga con switchMap para cancelar peticiones obsoletas y garantizar cierre de isLoading
    this.loadTrigger$.pipe(
      switchMap(({ url, requestParams, requestId }) => {
        const request$ = this.gridService?.onRefreshLoad?.(url, requestParams);
        if (!request$) {
          if (this.activeRequestId === requestId) {
            this.isLoading = false;
          }
          return EMPTY;
        }
        return request$.pipe(
          tap((response: any) => {
            if (this.activeRequestId === requestId) {
              this.isLoading = false;
            }
            const jsonResponse = this.dataAdapter
              ? this.dataAdapter(response, { ...requestParams })
              : response;
            const records = jsonResponse?.dataRecords;
            if (records) {
              this.dataRecords = records;
            } else {
              this._dataRecords = null;
              if (!this.dataSource) {
                this.dataSource = { rows: [], dataRecords: null };
              } else {
                this.dataSource.dataRecords = null;
                this.dataSource.rows = [];
              }
            }
            this.afterRefreshLoadCallbacks.forEach((callback) => callback(records));
          }),
          catchError((error) => {
            if (this.activeRequestId === requestId) {
              this.isLoading = false;
            }
            this.loadError.emit(error);
            return EMPTY;
          }),
          finalize(() => {
            if (this.activeRequestId === requestId) {
              this.isLoading = false;
            }
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /** Getter/setter sincronizado con `dataSource.rows` para mantener compatibilidad con accesos existentes. */
  public get rows(): any[] {
    return this.dataSource?.rows ?? [];
  }
  public set rows(value: any[]) {
    if (!this.dataSource) {
      this.dataSource = { rows: [], dataRecords: null };
    }
    this.dataSource.rows = Array.isArray(value) ? value : [];
  }

  /** Filas visibles considerando búsqueda y filtros locales sin mutar `dataSource.rows`. */
  public get displayedRows(): any[] {
    const sourceRows = this.dataSource?.rows;
    if (!Array.isArray(sourceRows) || sourceRows.length === 0) {
      return [];
    }
    if (this.mode !== 'local' || this.customBody) {
      return sourceRows;
    }

    const search = this.localSearchTerm.trim().toLowerCase();
    const filterEntries = Object.entries(this.localColumnFilters).filter(([, val]) => val.trim().length > 0);

    if (!search && filterEntries.length === 0) {
      return sourceRows;
    }

    const searchableKeys = this.leafColumns
      .map((c) => c.dataIndex)
      .filter((key): key is string => Boolean(key));

    return sourceRows.filter((row) => {
      if (!row) {
        return false;
      }
      // 1. Validar filtros por columna
      for (const [field, filterVal] of filterEntries) {
        const cellStr = String(row[field] ?? '').toLowerCase();
        if (cellStr.indexOf(filterVal.trim().toLowerCase()) === -1) {
          return false;
        }
      }
      // 2. Validar búsqueda global local
      if (search) {
        const keysToSearch = searchableKeys.length > 0 ? searchableKeys : Object.keys(row);
        const matchesGlobal = keysToSearch.some((key) =>
          String(row[key] ?? '').toLowerCase().indexOf(search) !== -1
        );
        if (!matchesGlobal) {
          return false;
        }
      }
      return true;
    });
  }

  public get headerRowOffset(): number {
    return this.headerRows.length + (this.allowFiltering ? 1 : 0) + 1;
  }

  // Enlace de clases de tema por instancia en el host
  @HostBinding('class.exodo-theme-light') get hostLight(): boolean { return this.theme === 'light'; }
  @HostBinding('class.exodo-theme-modern') get hostModern(): boolean { return this.theme === 'modern'; }
  @HostBinding('class.exodo-theme-dark') get hostDark(): boolean { return this.theme === 'dark'; }
  @HostBinding('class.exodo-theme-glacial') get hostGlacial(): boolean { return this.theme === 'glacial'; }
  @HostBinding('class.exodo-theme-sky') get hostSky(): boolean { return this.theme === 'sky'; }
  @HostBinding('class.exodo-theme-bone') get hostBone(): boolean { return this.theme === 'bone'; }
  @HostBinding('class.exodo-theme-gray') get hostGray(): boolean { return this.theme === 'gray'; }

  @Input()
  set themeInput(value: string | null) {
    this.theme = value;
  }

  ngOnInit(): void {
    this.rebuildHeaders();
  }

  ngAfterViewInit(): void {
    this.isAfterViewInit = true;
    if (this.dataSource?.dataRecords && this.showPagination) {
      this.setPagination(this.dataSource.dataRecords);
    }
    this.initTimer = setTimeout(() => {
      this.initTimer = null;
      if (this.mode === 'remote' && !this.hasInitiatedLoad && this.proxy?.api?.read) {
        this.onLoad(this.baseParams);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['headers']) {
      this.rebuildHeaders();
    }
    if (changes['dataSource']) {
      this.refreshDataRows();
    }
  }

  ngOnDestroy(): void {
    if (this.initTimer !== null) {
      clearTimeout(this.initTimer);
      this.initTimer = null;
    }
    this.cancelPendingSearch$.next();
    this.cancelPendingSearch$.complete();
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
    this.loadTrigger$.complete();
    this.afterRefreshLoadCallbacks = [];
  }

  canData(): boolean {
    if (!this.dataSource || !Array.isArray(this.dataSource.rows)) {
      return false;
    }
    if (this.customBody) {
      return this.dataSource.rows.length > 0;
    }
    return this.displayedRows.length > 0;
  }

  onLoad(params: any = {}, force = true): void {
    if (!this.proxy || !this.proxy?.api?.read) {
      return;
    }
    this.hasInitiatedLoad = true;
    // Guardar los parámetros base inmutables
    this.baseParams = params && typeof params === 'object' ? { ...params } : {};
    // Inicializar queryParams vacío (solo tendrá parámetros variables)
    this.queryParams = {};
    if (force) {
      this.onRefreshLoad(this.queryParams);
    }
  }

  inputKey(event: KeyboardEvent): void {
    if (this.mode !== 'remote') {
      return;
    }
    const isEnter = event.key === 'Enter' || event.keyCode === 13;
    if (!isEnter) {
      return;
    }
    const ele = event.target as HTMLInputElement;
    const searchString = ele?.value ?? '';
    if (searchString.length === 0 || searchString.length >= this.minChar) {
      // Cancelar debounce pendiente para evitar doble petición HTTP
      this.cancelPendingSearch$.next();
      this.searchQuery(searchString);
    }
  }

  searchQuery(searchQuery: string): void {
    if (this.mode !== 'remote') {
      return;
    }
    delete this.queryParams['query'];
    delete this.queryParams['search'];
    delete this.queryParams['searchQuery'];
    delete this.queryParams['searchParam'];

    if (searchQuery && searchQuery.length > 0) {
      this.queryParams['query'] = searchQuery;
      this.queryParams['search'] = searchQuery;
      this.queryParams['searchQuery'] = searchQuery;
      this.queryParams['searchParam'] = searchQuery;
    }

    this.resetPaginationParams();
    this.onRefreshLoad(this.queryParams);
  }

  public onRefreshPagination(page: number): void {
    const safePage = Math.max(1, Math.trunc(Number(page) || 1));
    this.queryParams['page'] = safePage;
    if (this.limit != null) {
      this.queryParams['limit'] = this.limit;
      this.queryParams['skip'] = (safePage - 1) * Number(this.limit);
    } else if (this.skip != null) {
      this.queryParams['skip'] = this.skip;
    }

    this.onRefreshLoad(this.queryParams);
  }

  private onRefreshLoad(params: any): void {
    if (this.mode !== 'remote' || !this.proxy?.api?.read) {
      return;
    }
    const url = this.proxy.api.read;
    const variableParams = params && typeof params === 'object' ? params : {};
    // Combinar respetando prioridad: baseParams como base + parámetros variables actualizados encima
    const requestParams: Record<string, any> = { ...this.baseParams, ...variableParams };
    if (this.limit != null && requestParams['limit'] == null) {
      requestParams['limit'] = this.limit;
    }
    if (this.skip != null && requestParams['skip'] == null) {
      requestParams['skip'] = this.skip;
    }

    const requestId = ++this.activeRequestId;
    this.isLoading = true;
    this.loadTrigger$.next({ url, requestParams, requestId });
  }

  set dataRecords(dataRecords: DataRecords | null) {
    this._dataRecords = dataRecords ?? null;
    if (!this.dataSource) {
      this.dataSource = { rows: [], dataRecords: null };
    }
    this.dataSource.dataRecords = this._dataRecords;
    this.dataSource.rows = Array.isArray(dataRecords?.data) ? dataRecords.data : [];
    if (dataRecords) {
      this.setPagination(dataRecords);
    }
    if (this.autoFocusSearch && this.searchField?.nativeElement) {
      this.searchField.nativeElement.focus();
    }
  }

  get dataRecords(): DataRecords | null {
    return this._dataRecords;
  }

  protected setPagination(dataRecords: DataRecords | null | undefined): void {
    if (this.showPagination && dataRecords && this.pagination) {
      this.pagination.onLoad({
        currentPage: dataRecords.current_page,
        from: dataRecords.from,
        lastPage: dataRecords.last_page,
        to: dataRecords.to,
        total: dataRecords.total,
        perPage: dataRecords.per_page
      });
    }
  }

  inputSearch(e: Event): void {
    const ele = e.target as HTMLInputElement;
    const value = ele?.value ?? '';
    if (this.mode === 'remote') {
      if (value.length === 0 || value.length >= this.minChar) {
        this.searchSubject.next(value);
      }
    } else if (this.customBody) {
      const tbody = this.tableGrid?.nativeElement?.tBodies?.[0];
      if (tbody) {
        this.gridService.filterItems(value, tbody);
      }
    } else {
      this.localSearchTerm = value;
    }
  }

  applyGridFilter(event: { field?: string; value?: any } | null | undefined): void {
    if (!event || !event.field) {
      return;
    }
    const rawValue = event.value === null || event.value === undefined ? '' : String(event.value);

    if (this.mode === 'local') {
      if (rawValue.trim().length === 0) {
        delete this.localColumnFilters[event.field];
      } else {
        this.localColumnFilters[event.field] = rawValue;
      }
      return;
    }

    if (rawValue.trim().length === 0) {
      delete this.queryParams['field'];
      delete this.queryParams['value'];
    } else {
      this.queryParams['field'] = event.field;
      this.queryParams['value'] = rawValue;
    }

    this.resetPaginationParams();
    this.onRefreshLoad(this.queryParams);
  }

  sort(column: ColumnContract): void {
    if (!this.allowSorting || !column?.dataIndex || column.sortable === false) {
      return;
    }

    if (this.sortColumn === column.dataIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.dataIndex;
      this.sortDirection = 'asc';
    }

    if (this.mode === 'remote') {
      this.queryParams['sort'] = this.sortColumn;
      this.queryParams['dir'] = this.sortDirection;
      this.resetPaginationParams();
      this.onRefreshLoad(this.queryParams);
    } else {
      const rows = this.dataSource?.rows;
      if (!Array.isArray(rows) || rows.length <= 1) {
        return;
      }
      const sortKey = this.sortColumn;
      const multiplier = this.sortDirection === 'asc' ? 1 : -1;
      this.dataSource.rows = [...rows].sort((a, b) => {
        const valA = a?.[sortKey];
        const valB = b?.[sortKey];
        if (valA === valB) {
          return 0;
        }
        if (valA === null || valA === undefined) {
          return 1;
        }
        if (valB === null || valB === undefined) {
          return -1;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * multiplier;
        }
        return String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' }) * multiplier;
      });
    }
  }

  /** Reconstruye las filas de encabezado y la lista de columnas hoja visibles sin mutar el input. */
  protected rebuildHeaders(): void {
    const sourceColumns = Array.isArray(this.columns) && this.columns.length > 0
      ? this.columns
      : (Array.isArray(this.headers) ? this.headers : []);

    if (sourceColumns.length === 0) {
      this.headerRows = [];
      this.leafColumns = [];
      return;
    }
    this.headerRows = this.buildHeaderRows(sourceColumns);
    this.leafColumns = this.collectLeafColumns(sourceColumns);
  }

  /**
   * Método público para reconstruir completamente el grid.
   * Útil cuando las columnas cambian dinámicamente o después de un refresh manual.
   */
  public rebuildGrid(): void {
    this.rebuildHeaders();
    this.refreshDataRows();
    if (this.isAfterViewInit && this.mode === 'remote' && this.proxy?.api?.read) {
      this.onLoad(this.baseParams, true);
    }
  }

  private refreshDataRows(): void {
    if (this.dataSource && Array.isArray(this.dataSource.rows)) {
      if (this.dataSource.dataRecords) {
        this.setPagination(this.dataSource.dataRecords);
      }
    }
  }

  /** Construye una matriz de filas de encabezado clonando nodos (sin mutar `columns`). */
  protected buildHeaderRows(columns: ColumnContract[]): ColumnContract[][] {
    const rows: ColumnContract[][] = [];

    const traverse = (cols: ColumnContract[], level = 0): void => {
      for (const col of cols) {
        if (!col || col.hidden) {
          continue;
        }
        const visibleLeafCount = this.countLeafColumns(col);
        if (visibleLeafCount === 0) {
          continue;
        }
        rows[level] = rows[level] || [];
        const cloned: ColumnContract = { ...col };
        if (col.children && col.children.length > 0) {
          cloned.colspan = col.colspan || visibleLeafCount;
          rows[level].push(cloned);
          traverse(col.children, level + 1);
        } else {
          rows[level].push(cloned);
        }
      }
    };

    traverse(columns, 0);

    const maxLevel = rows.length;
    for (let r = 0; r < maxLevel; r++) {
      for (const col of rows[r]) {
        if (!col.children || col.children.length === 0) {
          col.rowspan = col.rowspan || (maxLevel - r);
        }
      }
    }

    return rows;
  }

  protected countLeafColumns(col: ColumnContract): number {
    if (!col || col.hidden) {
      return 0;
    }
    if (!col.children || col.children.length === 0) {
      return 1;
    }
    return col.children.reduce((acc, child) => acc + this.countLeafColumns(child), 0);
  }

  protected collectLeafColumns(columns: ColumnContract[]): ColumnContract[] {
    const leaves: ColumnContract[] = [];
    const traverse = (cols: ColumnContract[]): void => {
      for (const col of cols) {
        if (!col || col.hidden) {
          continue;
        }
        if (col.children && col.children.length > 0) {
          traverse(col.children);
        } else {
          leaves.push(col);
        }
      }
    };
    traverse(columns);
    return leaves;
  }

  public onAfterRefreshLoad(callback: (dataRecords: DataRecords) => void): () => void {
    this.afterRefreshLoadCallbacks.push(callback);
    return () => {
      const idx = this.afterRefreshLoadCallbacks.indexOf(callback);
      if (idx !== -1) {
        this.afterRefreshLoadCallbacks.splice(idx, 1);
      }
    };
  }

  /**
   * Limpia todos los parámetros variables (búsqueda, filtros y ordenamiento)
   * preservando los parámetros base inmutables.
   */
  public clearFilters(): void {
    this.cancelPendingSearch$.next();
    this.queryParams = {};
    this.localSearchTerm = '';
    this.localColumnFilters = {};
    if (this.searchField?.nativeElement) {
      this.searchField.nativeElement.value = '';
    }
    this.filterComponents?.forEach((filter) => filter.reset());
    this.sortColumn = null;
    this.sortDirection = 'asc';

    if (this.mode === 'remote') {
      this.onRefreshLoad(this.queryParams);
    } else if (this.customBody) {
      const tbody = this.tableGrid?.nativeElement?.tBodies?.[0];
      if (tbody) {
        this.gridService.filterItems('', tbody);
      }
    }
  }

  public getBaseParams(): Record<string, any> {
    return { ...this.baseParams };
  }

  public getQueryParams(): Record<string, any> {
    return { ...this.baseParams, ...this.queryParams };
  }

  public getDataSource(): DataSourceContract {
    return this.dataSource;
  }

  public getSearchFieldId(): string {
    return this.searchField?.nativeElement?.id || this.searchFieldId;
  }

  public getSearchField(): ElementRef<HTMLInputElement> | undefined {
    return this.searchField;
  }

  public getSearchFieldValue(): string {
    return this.searchField?.nativeElement?.value ?? '';
  }

  public getTable(): ElementRef<HTMLTableElement> | undefined {
    return this.tableGrid;
  }

  public getTableId(): string {
    return this.tableGrid?.nativeElement?.id || this._uuid;
  }

  get uuid(): string {
    return this._uuid;
  }

  set uuid(value: string) {
    this._uuid = value;
  }

  public normalizeWidth(value?: string | number | null): string {
    if (value === null || value === undefined || value === '') {
      return 'auto';
    }
    const str = String(value).trim();
    return /^\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
  }

  public onCellChange(value: string, row: any, column: ColumnContract, rowIndex: number, columnIndex: number): void {
    this.cellChange.emit({ row, column, rowIndex, columnIndex, value });
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public trackByColumn(index: number, column: ColumnContract): string | number {
    return column?.dataIndex ?? column?.text ?? index;
  }

  public trackByRow = (index: number, row: any): any => {
    if (this.trackBy) {
      return this.trackBy(index, row);
    }
    return row?.id ?? index;
  };

  private resetPaginationParams(): void {
    this.queryParams['page'] = 1;
    if (this.limit != null) {
      this.queryParams['limit'] = this.limit;
      this.queryParams['skip'] = 0;
    } else if (this.skip != null) {
      this.queryParams['skip'] = 0;
    }
  }
}
