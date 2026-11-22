# Changelog

Todos los cambios notables en `exodolibs` se documentan en este archivo siguiendo el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y [Versionado Semántico](https://semver.org/lang/es/).

## [0.9.0] - 2026-11-21

### Seguridad
- **BREAKING CHANGE (comportamiento seguro en celdas):** `SafeHtmlPipe` ahora sanea el HTML mediante `DomSanitizer.sanitize(SecurityContext.HTML, ...)` en lugar de usar `bypassSecurityTrustHtml`, eliminando `<script>`, manejadores `on*`, URLs `javascript:` y atributos `style="..."` en línea.
- `GridCellComponent.getCellValue()` escapa automáticamente los valores planos con `escapeHTML` cuando la columna no define `cellRender`, cerrando el vector de XSS almacenado/reflejado en grillas.
- `ExodoCustomHtmlDirective` ahora sanea con `DomSanitizer`, reutiliza un único contenedor DOM y limpia sus nodos en `ngOnDestroy`. Se declara y exporta oficialmente en `DirectivesModule` y `public-api.ts`.

### Corregido
- **Concurrencia RxJS y ciclo de vida (`ExodoGridComponent`):**
  - Migración de `onRefreshLoad` a `switchMap` + `catchError` + `finalize` + `takeUntil(destroy$)`, cancelando peticiones obsoletas en lugar de descartar acciones del usuario y evitando que `isLoading` quede bloqueado.
  - Implementación de `OnDestroy` en `ExodoGridComponent`, `GridCellComponent` y `ExodoTooltipDirective` para eliminar fugas de suscripciones, timers y nodos DOM huérfanos.
  - Corrección del orden de mezcla de parámetros a `{ ...baseParams, ...params }` (consistente con `getQueryParams()`) y envío de `requestParams` completo a `dataAdapter`.
  - Guardas defensivas ante referencias nulas/indefinidas (`proxy.api.read`, `dataSource`, `dataRecords`, `pagination`, `searchField`, `tableGrid`).
  - Eliminación del envoltorio `@if(isAfterViewInit)` y asignación estable de `searchFieldId` desde el constructor.
  - Unificación del `<ng-content>` por defecto vía `ng-template` + `ngTemplateOutlet` para corregir `customBody="true"`.
  - Clonación inmutable en `buildHeaderRows()` sin mutar el array `columns` del consumidor y soporte real de `ColumnContract.hidden`, `bordered`, `leafColumns.length` en `colspan`/`aria-colcount` y `<ng-content select="[tableFooter]">`.
- **Filtros, búsqueda y edición en línea:**
  - Implementación de filtros por columna y búsqueda global no destructiva en modo local (`displayedRows`) y limpieza completa en `clearFilters()` (incluyendo `@ViewChildren(GridFilterComponent)`).
  - Corrección de ordenamiento local con `null`/`undefined`, formato de moneda tolerante a `NaN`/locales inválidos con caché de `Intl.NumberFormat`, atributos HTML reales `minlength`/`maxlength`, reversión con tecla `Escape` y respeto a `editing: false` en checkboxes booleanos.
  - Eliminación de cabecera CORS de respuesta inválida (`Access-Control-Allow-Methods`) y filtrado de parámetros `null`/`undefined` en `GridService`.
- **Paginación, Tooltips e i18n:**
  - Validación estricta y acotación `[1, lastPage]` en `ExodoPaginationComponent` (bloquea página `0`, negativos, `NaN` y strings), condición corregida `isFirstPage`/`isLastPage` con `[disabled]` real en botones, y soporte declarativo `@Input() paginationOptions`.
  - Reconexión del token global `EXODO_I18N` con `providedIn: 'root'` (sin sobrescritura en módulos lazy-loaded).
  - Accesibilidad WCAG en paginación: eliminación de `aria-hidden="true"` y `[title]` nativo en botones, añadidos `aria-label`, `inputmode="numeric"` y `[exodoTooltip]`.
  - Posicionamiento `position: fixed` con límites de viewport, flip vertical, soporte de teclado (`focusin`/`focusout`/`Escape`), herencia de tema `exodo-theme-*`, seguridad SSR (`DOCUMENT` + `PLATFORM_ID`) y ejecución fuera de `NgZone` en `ExodoTooltipDirective`.
- **Estilos, Temas y Empaquetado:**
  - Corrección de contraste en Dark Mode (`--exodo-card-footer-bg` y `--exodo-bg-alt-hover` definidos en los 7 temas), adición de `@HostBinding('class.exodo-theme-light')` en `ExodoGridComponent` y clases de tema sin sobreescritura en `ExodoPaginationComponent`.
  - Acotamiento de `:focus-visible` y reglas de `_table.scss` para evitar fugas globales de CSS en aplicaciones consumidoras.
  - Migración de SCSS a `@use`/`@forward`/`meta.load-css` sin deprecaciones de Dart Sass y eliminación de duplicación masiva de CSS en el bundle.
  - Eliminación de carpetas vendored no exportadas (`select/`, `ng-option-highlight/`) que provocaban la publicación accidental del secondary entry point `./src/lib/components/ng-option-highlight`.
  - Adición de `exports` SCSS, `peerDependencies` faltantes (`@angular/forms`, `@angular/platform-browser`, `bootstrap` opcional), `sideEffects`, `tslib: "^2.3.0"`, `LICENSE` y build multiplataforma en `ng-package.json` (incluyendo `lib/style.scss` válido).

### Añadido
- Exportación completa de contratos, tipos, `GridService`, `GridFilterComponent`, `GridFilterModule`, `SafeHtmlPipe`, `PipesModule`, `ExodoCustomHtmlDirective` y `escapeHTML` en `public-api.ts`.
- Nuevos `@Output()` aditivos `loadError` y `cellChange`, e `@Input()` aditivos `autoFocusSearch` y `trackBy` en `ExodoGridComponent`.
- Suites unitarias y de integración completas para seguridad XSS, `GridCellComponent`, `GridService`, `GridFilterComponent`, `ExodoTooltipDirective`, `ExodoCustomHtmlDirective`, `SafeHtmlPipe`, `ExodoPaginationComponent` y `ExodoGridComponent`.
- Launcher `ChromeHeadlessCI` en Karma, scripts `test:lib` / `test:ci`, workflow `.github/workflows/ci.yml`, pipeline idempotente de GitHub Releases (`.github/workflows/release.yml` + `scripts/build-release-notes.mjs`) y endurecimiento de `.github/workflows/publish-on-tag.yml`.
- Licencia MIT actualizada (`Copyright (c) 2023-2026 Lewis Oswaldo Lopez Gomez`) en `LICENSE`, `projects/exodolibs/LICENSE`, metadatos de `package.json` y documentación `README.md`.

## [0.8.13] - 2025-11-12
- Corrección de operador spread en llamadas `onLoad` y orden de combinación de parámetros.
