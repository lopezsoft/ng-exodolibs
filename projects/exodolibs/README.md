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

## Temas y traducción del paginador
La librería ahora soporta temas y traducciones para el componente `exodo-pagination`.

1) Usar temas globales (SCSS): en `src/styles.scss` de tu aplicación puedes importar uno de los temas provistos antes de los estilos de Exodolibs:

```scss
@import 'node_modules/exodolibs/assets/exodostyles/themes/_light.scss'; // o _dark.scss
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

