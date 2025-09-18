# Exodolibs
Es una librería que permite automatizar el uso de DataGrid, Selects para el consumo de datos desde el lado
del servidor, inicialmente solo tiene un DataGrid Básico
## Instrucciones

Hay que seguir las siguientes instrucciones para un correcto uso de la librería

### Instalación

```npm install exodolibs```

### Configuración

En el app.module.ts (por defecto) tenemos que importar el módulo de la librería **"ExodolibsModule"**

```
import { ExodolibsModule } from 'exodolibs';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ExodolibsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
### Añadir estilos
En src/styles de la app principal importamos
```
@import './../node_modules/exodolibs/assets/style.scss';
```
### Uso

## Nuevas funcionalidades
La versión actual incluye mejoras importantes al `DataGrid`:

- Filtros por columna (UI integrada y búsqueda por columna)
- Ordenamiento por columna (click en cabeceras, asc/desc)
- Paginación remota y local con soporte para adaptadores de datos

Estas funcionalidades están diseñadas para ser retrocompatibles con implementaciones existentes.

### Uso básico del `exodo-grid`

```html
<exodo-grid
  [columns]="columns"
  [dataSource]="dataSource"
  mode="local|remote"
  [allowFiltering]="true"
  [allowSorting]="true"
  [showPagination]="true|false"
  [proxy]="{ api: { read: 'https://api.example.com/users' } }"
  [dataAdapter]="dataAdapterFn"
  [labels]="paginationLabels"
  [lang]="currentLang">
</exodo-grid>
```

- `mode`: `local` (usa `dataSource.rows`) o `remote` (llama a `proxy.api.read`).
- `allowFiltering` y `allowSorting`: habilitan UI y lógica en la grilla.
- `dataAdapter`: (opcional) función que transforma la respuesta cruda de la API al formato interno esperado por la grilla (ver más abajo).
- `labels`: (opcional) objeto con textos para el paginador — si no se provee, se usan defaults o Transloco si está disponible.

### `dataAdapter` (adaptador de respuestas)

Para desacoplar la grilla de la estructura específica de tu backend (por ejemplo Laravel), la propiedad `dataAdapter` permite pasar una función que reciba la respuesta cruda y los parámetros de petición, y devuelva un objeto con la forma `JsonResponse` que la grilla espera:

```typescript
// Firma: (response: any, params: any) => JsonResponse
dataAdapter(response: any, params: any) {
  // mapear response a dataRecords
  return {
    success: true,
    message: 'OK',
    dataRecords: {
      current_page: 1,
      from: 1,
      last_page: 1,
      to: response.length,
      total: response.length,
      per_page: 10,
      data: response.slice(0, 10)
    }
  };
}
```

Ejemplos:

- Si tu API ya devuelve un objeto de paginación tipo Laravel, tu `dataAdapter` puede simplemente mapear nombres distintos de campos.
- Si tu API devuelve un array (p. ej. `jsonplaceholder`), el `dataAdapter` puede simular la paginación en cliente (slice por página).

La grilla usa el `dataAdapter` si está presente; si no, asumirá que la respuesta ya tiene la forma `JsonResponse` (esto mantiene compatibilidad con código en producción que no usa adapter).

### Traducciones y `Transloco`

El paginador intenta resolver textos en el siguiente orden de prioridad:

1. `@Input() labels` (valor pasado directamente al componente)
2. `@ngneat/transloco` — namespace `exodo.pagination` (si Transloco está instalado y configurado)
3. Proveedor global `EXODO_I18N` (InjectionToken)
4. Labels por defecto incluidos en la librería (español)

Claves de Transloco soportadas:

- `exodo.pagination.first`
- `exodo.pagination.previous`
- `exodo.pagination.page`
- `exodo.pagination.of`
- `exodo.pagination.next`
- `exodo.pagination.last`
- `exodo.pagination.refresh`
- `exodo.pagination.infoTemplate`

Si usas Transloco, coloca las claves dentro de tu JSON de traducciones (p. ej. `src/assets/i18n/en.json`).

### Ejemplo práctico (component.ts)

```typescript
columns = [
  { text: 'ID', dataIndex: 'id' },
  { text: 'Name', dataIndex: 'name' }
];

paginationLabels = {
  first: 'First', previous: 'Prev', page: 'Page', of: 'of', next: 'Next', last: 'Last', refresh: 'Refresh', infoTemplate: '{{from}} - {{to}} of {{total}}'
};

// Adapter para jsonplaceholder (array simple -> paginado en cliente)
dataAdapter(response: any[], params: any) {
  const page = params.page || 1;
  const perPage = params.per_page || 10;
  const total = response.length;
  const last = Math.ceil(total / perPage);
  const pageData = response.slice((page - 1) * perPage, page * perPage);
  return {
    success: true,
    message: 'OK',
    dataRecords: {
      current_page: page,
      from: (page - 1) * perPage + 1,
      last_page: last,
      to: (page - 1) * perPage + pageData.length,
      total,
      per_page: perPage,
      data: pageData
    }
  };
}
```

### Tests

Para ejecutar los tests del workspace (ejecuta esto en la raíz del repo):

```bash
npm install
npm run test
```

Si hay fallos en los tests, la salida del runner (Karma/Jasmine) mostrará los detalles. Corrige fallos en los componentes afectados y vuelve a ejecutar.

### Publicación

Antes de publicar la librería (`npm publish`), asegúrate de:

1. Ejecutar y dejar todos los tests verdes (`npm run test`).
2. Construir el paquete (`ng build exodolibs` o `npm run build` si el script está disponible).
3. Actualizar la versión en `projects/exodolibs/package.json`.
4. Subir tag y push al repositorio (`git tag vX.Y.Z && git push --tags`).
5. Ejecutar `npm publish --access public` desde el paquete generado si corresponde.

---


## Temas y traducción del paginador
La librería ahora soporta temas y traducciones para el componente `exodo-pagination`.

1) Usar temas globales (SCSS): en `src/styles.scss` de tu aplicación puedes importar uno de los temas provistos antes de los estilos de Exodolibs:

```scss
/* Blanco Glacial es ahora el theme por defecto. Si quieres usar otro theme explícitamente puedes importarlo antes: */
@import 'node_modules/exodolibs/assets/exodostyles/themes/_light.scss'; // opcional
@import 'node_modules/exodolibs/assets/style.scss';
```

2) Aplicar tema por componente: el componente `exodo-pagination` acepta el `@Input() theme` con valores `'' | 'light' | 'dark'`.

```html
<exodo-pagination [theme]="'dark'" ... ></exodo-pagination>
```

3) Traducción del paginador: puedes inyectar labels vía `@Input() labels` con las claves disponibles: `first`, `previous`, `page`, `of`, `next`, `last`, `refresh`, `infoTemplate`.

Ejemplo:

```html
<exodo-pagination
  [labels]="{
    first: 'First',
    previous: 'Prev',
    page: 'Page',
    of: 'of',
    next: 'Next',
    last: 'Last',
    refresh: 'Refresh',
    infoTemplate: '{{from}} - {{to}} of {{total}}'
  }"
  ...></exodo-pagination>
```

Nota: si no se proveen labels, se usan textos por defecto en español.

4) Proveedor global de traducciones (opcional): puedes configurar traducciones globales para todos los componentes usando el `InjectionToken` `EXODO_I18N`.

```typescript
import { EXODO_I18N } from 'exodolibs';

@NgModule({
  providers: [
    { provide: EXODO_I18N, useValue: { page: 'Page', of: 'of', infoTemplate: '{{from}}-{{to}} of {{total}}' } }
  ]
})
export class AppModule {}
```
Si provees `labels` en un componente, ese valor anulará la configuración global.

5) Uso con Transloco (opcional - recomendado para proyectos que ya usan Transloco)

Si tu aplicación usa `@ngneat/transloco`, `ExodoPaginationComponent` intentará traducir las claves bajo el namespace `exodo.pagination` antes de usar los textos por defecto. Las keys disponibles son:

- `exodo.pagination.first`
- `exodo.pagination.previous`
- `exodo.pagination.page`
- `exodo.pagination.of`
- `exodo.pagination.next`
- `exodo.pagination.last`
- `exodo.pagination.refresh`
- `exodo.pagination.infoTemplate`

Ejemplo (archivo de traducciones JSON):

```json
{
  "exodo": {
    "pagination": {
      "first": "Primera",
      "previous": "Anterior",
      "page": "Página",
      "of": "de",
      "next": "Siguiente",
      "last": "Última",
      "refresh": "Actualizar",
      "infoTemplate": "{{from}} - {{to}} de {{total}}"
    }
  }
}
```

Recuerda instalar `@ngneat/transloco` en tu proyecto y configurarlo según su documentación si quieres aprovechar traducciones automáticas.

---

Nota sobre Transloco y esta workspace:

La librería `exodolibs` declara `@ngneat/transloco` como `peerDependency`. Para facilitar el desarrollo local y las demos incluidas en este repositorio, esta workspace mantiene `@ngneat/transloco` como `devDependency` en el `package.json` raíz. Si vas a usar `exodolibs` en producción, instala y configura `@ngneat/transloco` en tu aplicación si quieres usar la traducción automática del paginador.

