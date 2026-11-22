import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Accept', 'application/json');
  }

  private buildHttpParams(params: Record<string, any> | null | undefined): HttpParams {
    let httpParams = new HttpParams();
    if (!params || typeof params !== 'object') {
      return httpParams;
    }
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === null || value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== null && item !== undefined) {
            httpParams = httpParams.append(key, String(item));
          }
        }
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  onRefreshLoad(url: string, params: any = {}): Observable<any> {
    return this.http.get<any>(`${url}`, {
      headers: this.getHeaders(),
      params: this.buildHttpParams(params)
    });
  }

  filterItems(query: string, table: HTMLTableSectionElement | null | undefined): void {
    if (!table || !table.rows) {
      return;
    }
    const normalizedQuery = (query ?? '').toLowerCase();
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      let match = normalizedQuery.length === 0;
      if (!match) {
        for (let c = 0; c < row.cells.length; c++) {
          const cellText = (row.cells[c].textContent ?? '').toLowerCase();
          if (cellText.indexOf(normalizedQuery) !== -1) {
            match = true;
            break;
          }
        }
      }
      row.style.display = match ? '' : 'none';
    }
  }

  getUniqueId(prefix: string = ''): string {
    const safePrefix = typeof prefix === 'string' && prefix.length > 2 ? prefix : 'exodo-lib-';
    return safePrefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
  }
}
