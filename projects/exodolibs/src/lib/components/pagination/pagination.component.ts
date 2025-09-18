import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, HostBinding} from '@angular/core';
import {DataRecords, PaginationOptions} from '../grid/contracts/data-source';
import { ExodoI18n } from '../../i18n';

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
    infoTemplate?: string;
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
  constructor() {
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
    const tmpl = this.labels?.infoTemplate || this.defaultLabels.infoTemplate || '';
    return String(tmpl)
      .replace('{{from}}', String(this.paginationOptions.from))
      .replace('{{to}}', String(this.paginationOptions.to))
      .replace('{{total}}', String(this.paginationOptions.total));
  }

  /** Devuelve el label por clave siguiendo prioridad: labels input, transloco, i18n provider, defaultLabels */
  public getLabel(key: keyof ExodoI18n): string {
    // 1. labels input
    if (this.labels && (this.labels as any)[key]) {
      return (this.labels as any)[key];
    }
    // 2. defaults
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
