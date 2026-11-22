import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DataRecords, PaginationOptions } from '../grid/contracts/data-source';
import { DEFAULT_EXODO_I18N, EXODO_I18N, ExodoI18n } from '../../i18n';

@Component({
  selector: 'exodo-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./../../assets/exodostyles/pagination.component.scss'],
  standalone: false
})
export class ExodoPaginationComponent implements OnInit {
  private _paginationOptions: PaginationOptions | null = null;
  private _theme = '';
  private appliedHostClasses: string[] = [];

  @ViewChild('pagInput') pagInput?: ElementRef<HTMLInputElement>;
  @Output() onRefreshPagination = new EventEmitter<number>();

  /** Opciones de paginación (soporta uso declarativo vía Input o imperativo vía onLoad/setPagination). */
  @Input()
  set paginationOptions(options: PaginationOptions | null | undefined) {
    this._paginationOptions = options ? this.normalizeOptions(options) : null;
  }
  get paginationOptions(): PaginationOptions | null {
    return this._paginationOptions;
  }

  /** Tema a aplicar: '' | 'light' | 'dark' | 'modern' | 'glacial' | 'sky' | 'bone' | 'gray'. */
  @Input()
  set theme(value: string | null | undefined) {
    this._theme = (value ?? '').trim();
    this.syncHostThemeClasses();
  }
  get theme(): string {
    return this._theme;
  }

  /** Etiquetas personalizadas para sobrescribir la configuración global de EXODO_I18N. */
  @Input() labels: ExodoI18n | null | undefined = {};

  public defaultLabels: ExodoI18n = { ...DEFAULT_EXODO_I18N };

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Optional() @Inject(EXODO_I18N) private i18n?: ExodoI18n
  ) {}

  ngOnInit(): void {
    this.syncHostThemeClasses();
  }

  public get normalizedCurrentPage(): number {
    return this.toSafeInteger(this._paginationOptions?.currentPage, 1);
  }

  public get normalizedLastPage(): number {
    const rawLast = this.toSafeInteger(this._paginationOptions?.lastPage, 0);
    if (rawLast >= 1) {
      return rawLast;
    }
    const total = this.toSafeInteger(this._paginationOptions?.total, 0);
    const perPage = this.toSafeInteger(this._paginationOptions?.perPage, 0);
    if (total > 0 && perPage > 0) {
      return Math.max(1, Math.ceil(total / perPage));
    }
    return 1;
  }

  public get isFirstPage(): boolean {
    return this.normalizedCurrentPage <= 1;
  }

  public get isLastPage(): boolean {
    return this.normalizedCurrentPage >= this.normalizedLastPage;
  }

  public refreshPagination(page: number): void {
    const safePage = Math.min(Math.max(this.toSafeInteger(page, 1), 1), this.normalizedLastPage);
    this.onRefreshPagination.emit(safePage);
  }

  public goToFirstPage(): void {
    this.onNextPage(1);
  }

  public goToPreviousPage(): void {
    this.onNextPage(this.normalizedCurrentPage - 1);
  }

  public goToNextPage(): void {
    this.onNextPage(this.normalizedCurrentPage + 1);
  }

  public goToLastPage(): void {
    this.onNextPage(this.normalizedLastPage);
  }

  protected onNextPage(page: number | string | null | undefined): void {
    if (!this._paginationOptions) {
      return;
    }
    const currentPage = this.normalizedCurrentPage;
    const maxPage = this.normalizedLastPage;
    const rawStr = page === null || page === undefined ? '' : String(page).trim();
    const parsed = Number(rawStr);

    if (!rawStr || !Number.isFinite(parsed)) {
      this.syncInputValue(currentPage);
      return;
    }

    const targetPage = Math.min(Math.max(Math.trunc(parsed), 1), maxPage);
    if (targetPage === currentPage) {
      this.syncInputValue(currentPage);
      return;
    }

    this.refreshPagination(targetPage);
  }

  onLoad(options: PaginationOptions | null | undefined): void {
    this.paginationOptions = options ?? null;
  }

  /** Construye el texto informativo reemplazando todos los placeholders por valores seguros. */
  public getInfoText(): string {
    if (!this._paginationOptions) {
      return '';
    }
    const tmpl = this.getLabel('infoTemplate');
    const from = this._paginationOptions.from ?? 0;
    const to = this._paginationOptions.to ?? 0;
    const total = this._paginationOptions.total ?? 0;
    return String(tmpl)
      .replace(/\{\{from\}\}/g, String(from))
      .replace(/\{\{to\}\}/g, String(to))
      .replace(/\{\{total\}\}/g, String(total));
  }

  /** Devuelve el label por clave siguiendo prioridad: labels input -> EXODO_I18N -> defaultLabels. */
  public getLabel(key: keyof ExodoI18n): string {
    if (this.labels && this.labels[key]) {
      return this.labels[key] as string;
    }
    if (this.i18n && this.i18n[key]) {
      return this.i18n[key] as string;
    }
    return (this.defaultLabels[key] as string) || '';
  }

  setPagination(dataRecords: DataRecords | null | undefined): void {
    if (!dataRecords) {
      return;
    }
    this.paginationOptions = {
      currentPage: dataRecords.current_page,
      from: dataRecords.from,
      lastPage: dataRecords.last_page,
      to: dataRecords.to,
      total: dataRecords.total,
      perPage: dataRecords.per_page
    };
  }

  private normalizeOptions(options: PaginationOptions): PaginationOptions {
    const perPage = this.toOptionalFiniteNumber(options.perPage);
    const total = this.toOptionalFiniteNumber(options.total);
    let lastPage = this.toOptionalFiniteNumber(options.lastPage);
    if (lastPage === undefined && total !== undefined && perPage !== undefined && perPage > 0) {
      lastPage = Math.max(1, Math.ceil(total / perPage));
    }
    const currentPage = Math.max(1, this.toSafeInteger(options.currentPage, 1));
    return {
      ...options,
      currentPage,
      lastPage,
      perPage,
      total,
      from: this.toOptionalFiniteNumber(options.from),
      to: this.toOptionalFiniteNumber(options.to)
    };
  }

  private toOptionalFiniteNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toSafeInteger(value: unknown, fallback: number): number {
    const parsed = this.toOptionalFiniteNumber(value);
    return parsed === undefined ? fallback : Math.trunc(parsed);
  }

  private syncInputValue(value: number): void {
    if (this.pagInput?.nativeElement) {
      this.pagInput.nativeElement.value = String(value);
    }
  }

  /** Actualiza clases de tema en el host sin sobrescribir clases del consumidor (ej. table-responsive). */
  private syncHostThemeClasses(): void {
    const host = this.el?.nativeElement;
    if (!host) {
      return;
    }
    for (const cls of this.appliedHostClasses) {
      this.renderer.removeClass(host, cls);
    }
    this.appliedHostClasses = this._theme
      ? [`exodo-pagination-${this._theme}`, `exodo-theme-${this._theme}`]
      : ['exodo-pagination'];
    for (const cls of this.appliedHostClasses) {
      this.renderer.addClass(host, cls);
    }
  }
}
