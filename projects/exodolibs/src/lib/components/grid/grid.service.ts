import {ElementRef, Injectable, ViewChild} from '@angular/core';
import {ExodoPaginationComponent} from "../pagination/pagination.component";
import {DataSourceContract, Proxy} from "./contracts";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {JsonResponse} from "./contracts/data-source";
@Injectable({
  providedIn: 'root'
})
export class GridService {
  public rows: any = [];
  protected queryParams: any = {};
  public isLoading: boolean;
  public showPagination: boolean;
  @ViewChild('pagination') pagination: ExodoPaginationComponent;
  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('tableGrid') tableGrid: ElementRef<HTMLTableElement>;

  public dataSource: DataSourceContract = {
    rows: [],
    dataRecords: null
  };
  public proxy: Proxy = {
    api: {
      read: null,
      create: null,
      update: null,
      destroy: null,
    }
  };
  constructor(
    private http: HttpClient,
  ) { }

  private getHeaders(): HttpHeaders {
    const
      headers = new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    return  headers;
  }
  public onRefreshPagination(page: number): void {
    const params  = {...this.queryParams, page};
    this.queryParams  = params;
    this.onRefreshLoad(params);
  }
  onLoad(params: any = {}): void {
    const me = this;
    if (!me.proxy || !me.proxy?.api?.read) { return; }
    const url = me.proxy.api.read;
    me.queryParams = params;
    me.onRefreshLoad(params);
  }

  private onRefreshLoad(params: any = {}): void {
    const me  = this;
    if (me.isLoading) {
      return;
    }
    const url = me.proxy.api.read;
    me.isLoading  = true;
    me.http.get(`${url}`, { headers : me.getHeaders(), params: params })
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
      });
  }
  inputKey(event: any): void {
    const ts  = this;
    if (!ts.isLoading) {
      const searchString  = ts.searchField.nativeElement.value;
      if (event.keyCode === 13 && searchString.length >= 0) {
        ts.searchQuery();
      }
    }
  }
  searchQuery() {
    const searchQuery = this.searchField.nativeElement.value;
    const params      = {...this.queryParams, query: searchQuery};
    this.queryParams  = params;
    this.onRefreshLoad(params);
  }
  filterItems(query) {
    const table = this.tableGrid.nativeElement.tBodies[0];
    let r = 0;
    let row;
    while (row = table.rows[r++]) {
      if (row.innerText.toLowerCase().indexOf(query.toLowerCase()) !== -1)
        row.style.display = null;
      else
        row.style.display = 'none';
    }
  }
}
