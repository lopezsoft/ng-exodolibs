import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {DataRecords, PaginationOptions} from '../grid/contracts/data-source';

@Component({
  selector: 'exodo-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./../../assets/exodostyles/pagination.component.scss'],
})
export class ExodoPaginationComponent implements OnInit {
  public paginationOptions: PaginationOptions = null;
  @ViewChild('pagInput') pagInput: ElementRef;
  @Output() onRefreshPagination = new EventEmitter<number>();
  constructor() { }
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
