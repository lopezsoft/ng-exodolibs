import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, HostBinding, Inject, Optional, Injector} from '@angular/core';
import {DataRecords, PaginationOptions} from '../grid/contracts/data-source';
import { EXODO_I18N, ExodoI18n } from '../../i18n';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'exodo-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./../../assets/exodostyles/pagination.component.scss'],
})
export class ExodoPaginationComponent implements OnInit {
  public paginationOptions: PaginationOptions = null;
  @ViewChild('pagInput') pagInput: ElementRef;
  @Output() onRefreshPagination = new EventEmitter<number>();
  /** Theme to apply: '' | 'light' | 'dark' */
  @Input() theme: string = '';
  /** Optional language code to use for translations (e.g. 'en', 'es'). If provided and Transloco is available, it will be used. */
  @Input() lang?: string;
  @HostBinding('class') get hostClass(): string {
    return this.theme ? `exodo-pagination-${this.theme}` : 'exodo-pagination';
  }

  /** Labels for translations. Provide an object with keys: first, previous, page, of, next, last, refresh, infoTemplate. */
  @Input() labels: {
    first?: string;
    previous?: string;
    page?: string;
    of?: string;
    next?: string;
    last?: string;
    refresh?: string;
    infoTemplate?: string; // e.g. "{{from}} - {{to}} of {{total}}"
  } = {};

  public defaultLabels = {
    first: 'Primera página',
    previous: 'Página anterior',
    page: 'Página',
    of: 'de',
    next: 'Siguiente página',
    last: 'Última página',
    refresh: 'Actualizar',
    infoTemplate: '{{from}} - {{to}} de {{total}}'
  };
  public i18n?: ExodoI18n;
  constructor(private injector: Injector,
              @Optional() @Inject(EXODO_I18N) i18n?: ExodoI18n) {
    this.i18n = i18n;
  }
  ngOnInit(): void {
  }
  public refreshPagination(page: number): void {
    this.onRefreshPagination.emit(page);
  }
  protected onNextPage(page: any): void {
    if (page > this.paginationOptions.lastPage) {
      page  = this.paginationOptions.lastPage;
    }
    if (Number(page) === this.paginationOptions.currentPage) { return; }
    this.refreshPagination(page);
  }
  onLoad(options: PaginationOptions): void {
    this.paginationOptions  = options;
  }

  /** Construye el texto informativo reemplazando placeholders por valores actuales */
  public getInfoText(): string {
    if (!this.paginationOptions) { return ''; }
  const tmpl = this.labels?.infoTemplate || this.defaultLabels.infoTemplate || this.i18n?.infoTemplate || '';
    return String(tmpl)
      .replace('{{from}}', String(this.paginationOptions.from))
      .replace('{{to}}', String(this.paginationOptions.to))
      .replace('{{total}}', String(this.paginationOptions.total));
  }

  /** Devuelve el label por clave siguiendo prioridad: labels input, transloco, i18n provider, defaultLabels */
  public getLabel(key: keyof ExodoI18n): string {
    // 1. Input override
    if ((this.labels as any)?.[key]) { return (this.labels as any)[key]; }
    // 2. Transloco (lazy-get from Injector to avoid creating a hard DI edge)
    try {
      const transloco = this.injector.get(TranslocoService as any, null) as TranslocoService | null;
      if (transloco) {
        if (this.lang) {
          try { transloco.setActiveLang(this.lang); } catch (e) { /* ignore */ }
        }
        const t = transloco.translate(`exodo.pagination.${key}`) as string;
        if (t) { return t; }
      }
    } catch (e) {
      // ignore - fallback to provider/defaults
    }
    // 3. provider
    if (this.i18n && (this.i18n as any)[key]) { return (this.i18n as any)[key]; }
    // 4. defaults
    return (this.defaultLabels as any)[key] || '';
  }
  setPagination(dataRecords: DataRecords): void {
    const me  = this;
    if (dataRecords) {
      me.paginationOptions = {
        currentPage : dataRecords.current_page,
        from        : dataRecords.from,
        lastPage    : dataRecords.last_page,
        to          : dataRecords.to,
        total       : dataRecords.total,
        perPage     : dataRecords.per_page
      };
    }
  }
}
