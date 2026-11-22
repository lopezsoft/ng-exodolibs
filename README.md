# ExodoLibs

Librería de componentes UI para Angular enfocada en DataGrid remoto/local, paginación personalizable, filtros por columna, edición en línea, temas por instancia y tooltips accesibles.

## Compatibilidad

**Versiones de Angular soportadas:** 18.x, 19.x, 20.x

```bash
npm install exodolibs
```

### Prerrequisitos

- Angular `^18.0.0 || ^19.0.0 || ^20.0.0` (`@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`) y `rxjs ^7.0.0`.
- `provideHttpClient()` (o `HttpClientModule`) configurado en tu aplicación para el modo remoto de `<exodo-grid>`.
- **Bootstrap 5** (opcional, recomendado para utilidades `.card`, `.table-*`, `.input-group`, `.pagination`) y **FontAwesome 5 o 6** para los íconos por defecto.

## Configuración

### Con NgModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ExodolibsModule } from 'exodolibs';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ExodolibsModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Con Componentes Standalone (Angular 18–20)

```typescript
import { Component } from '@angular/core';
import { ExodolibsModule } from 'exodolibs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ExodolibsModule],
  template: `<exodo-grid [columns]="columns" [dataSource]="dataSource" mode="local"></exodo-grid>`
})
export class UsersComponent {}
```

### Estilos y Temas

En el archivo `src/styles.scss` de tu aplicación importa la hoja unificada (compatible con `@use` en Dart Sass moderno y `@import` clásico):

```scss
// Recomendado (Angular 18–20 / Dart Sass moderno)
@use 'exodolibs/assets/style.scss';

// También compatible con rutas heredadas:
// @import 'exodolibs/lib/style.scss';
// @import 'node_modules/exodolibs/assets/style.scss';
```

Temas integrados (aplicables por instancia mediante `[theme]` en `<exodo-grid>` y `<exodo-pagination>`):
`glacial` *(por defecto)*, `dark`, `light`, `modern`, `sky`, `bone`, `gray`.

```html
<exodo-grid [theme]="'dark'" ...></exodo-grid>
<exodo-pagination [theme]="'dark'" ...></exodo-pagination>
```

## API del Grid (`<exodo-grid>`)

### Inputs principales

- `columns: ColumnContract[]` — Definición de columnas (soporta `children` multinivel, `hidden`, `sortable`, `editing`, `clicksToEdit`, `type`, `format`, `currency`, `cellRender`, `tooltip`, `tooltipRender`).
- `dataSource: DataSourceContract` — Datos `{ rows, dataRecords }`.
- `mode: 'local' | 'remote'` — Modo de operación (por defecto: `'remote'`).
- `proxy: Proxy` — Configuración `{ api: { read: '/api/items' } }` para modo remoto.
- `allowSorting: boolean` — Habilita ordenamiento de columnas.
- `allowFiltering: boolean` — Habilita filtros por columna (en modo remoto y local).
- `showPagination: boolean` — Muestra controles de paginación en modo remoto (por defecto: `true`).
- `bordered: boolean` — Controla el borde de la tabla (por defecto: `true`).
- `limit: number` — Elementos por página (por defecto: `15`).
- `skip: number` — Offset inicial calculado automáticamente desde `page` y `limit`.
- `dataAdapter: (response: any, params: any) => JsonResponse` — Adaptador opcional de respuestas crudas.
- `labels: ExodoI18n` — Etiquetas personalizadas del paginador.
- `theme: string` — Tema aplicado al host (`'glacial' | 'dark' | 'light' | 'modern' | 'sky' | 'bone' | 'gray'`).
- `autoFocusSearch: boolean` — Devuelve el foco al campo de búsqueda tras cada carga remota (por defecto: `false`).
- `trackBy: TrackByFunction<any>` — Función `trackBy` opcional para filas.

### Outputs principales

- `loadError: EventEmitter<any>` — Se emite cuando falla una petición HTTP remota.
- `cellChange: EventEmitter<GridCellChangeEvent>` — Se emite cuando se edita el valor de una celda.

### Métodos públicos

- `onLoad(params?: Record<string, any>, force = true)` — Define `baseParams` inmutables y dispara la carga inicial.
- `clearFilters()` — Limpia búsqueda, filtros por columna y ordenamiento conservando `baseParams`.
- `rebuildGrid()` — Reconstruye cabeceras, datos y recarga si está en modo remoto.
- `onAfterRefreshLoad(callback)` — Registra un callback tras cada carga remota y devuelve una función `() => void` para desuscribirse.
- `getBaseParams()` / `getQueryParams()` — Consultan los parámetros base o combinados actuales.

### Uso básico

```html
<exodo-grid
  [columns]="columns"
  [dataSource]="dataSource"
  mode="remote"
  [proxy]="{ api: { read: 'https://api.example.com/users' } }"
  [limit]="25"
  [allowFiltering]="true"
  [allowSorting]="true"
  [showPagination]="true"
  [dataAdapter]="dataAdapter"
  [labels]="paginationLabels"
  [theme]="'glacial'"
  (loadError)="onGridError($event)"
  (cellChange)="onCellEdited($event)">
</exodo-grid>
```

### Seguridad en celdas (`SafeHtmlPipe` y `cellRender`)

A partir de la versión **0.9.0**:
- Las columnas **sin `cellRender`** escapan automáticamente los caracteres HTML para mostrarse siempre como texto plano seguro.
- `SafeHtmlPipe` (`| safeHtml`) y `ExodoCustomHtmlDirective` (`[elExodoCustomHtml]`) sanean el HTML mediante `DomSanitizer.sanitize(SecurityContext.HTML, ...)`, eliminando `<script>`, manejadores `on*`, URLs `javascript:` y atributos `style="..."` en línea. Utiliza clases CSS en tus `cellRender`.

### Traducciones globales (`EXODO_I18N`)

El paginador y los filtros resuelven etiquetas en este orden de prioridad:
1. `@Input() labels` en el componente.
2. Proveedor global `EXODO_I18N` (`InjectionToken<ExodoI18n>`).
3. Etiquetas por defecto en español (`DEFAULT_EXODO_I18N`).

```typescript
import { EXODO_I18N } from 'exodolibs';

providers: [
  {
    provide: EXODO_I18N,
    useValue: {
      first: 'First',
      previous: 'Previous',
      page: 'Page',
      of: 'of',
      next: 'Next',
      last: 'Last',
      refresh: 'Refresh',
      navigation: 'Pagination navigation',
      filterBy: 'Filter by',
      infoTemplate: '{{from}} - {{to}} of {{total}}'
    }
  }
]
```

## Desarrollo, Pruebas y Publicación

```bash
# Ejecutar pruebas unitarias en modo CI (librería + app demo)
npm run test:ci

# Ejecutar solo pruebas de la librería
npm run test:lib

# Compilar la librería para producción
npm run lib
```

La publicación en npm se ejecuta automáticamente mediante GitHub Actions (`.github/workflows/publish-on-tag.yml`) al crear y subir un tag `vX.Y.Z` que coincida con la versión de `package.json` y `projects/exodolibs/package.json`.
