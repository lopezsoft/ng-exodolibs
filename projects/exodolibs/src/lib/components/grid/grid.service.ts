import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {JsonResponse} from "./contracts/data-source";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GridService {
  constructor(
    private http: HttpClient,
  ) { }

  private getHeaders(): HttpHeaders {
    return  new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  }

  onRefreshLoad(url: string, params: any = {}) {
    const me  = this;
    return me.http.get(`${url}`, { headers : me.getHeaders(), params: params })
      .pipe(map((resp: JsonResponse) => {
        return resp;
      }));
  }
  filterItems(query: string, table: HTMLTableSectionElement) {
    let r = 0;
    let row: HTMLTableRowElement;
    while (row = table.rows[r++]) {
      let match = false;  // Variable para llevar el registro si la consulta coincide en alguna celda de la fila
      for (let c = 0, cell; cell = row.cells[c++];) {  // Itera sobre todas las celdas de la fila
        if (cell.innerText.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
          match = true;  // Si se encuentra la consulta en alguna celda, establece la coincidencia en true
          break;  // Rompe el bucle si se encuentra una coincidencia, no es necesario seguir buscando en esta fila
        }
      }
      row.style.display = match ? null : 'none';  // Muestra u oculta la fila basándose en si hubo una coincidencia
    }
  }
  getUniqueId(prefix: string = ''): string {
    prefix = prefix.length > 2 ? prefix : 'exodo-lib-';
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
  }
}
