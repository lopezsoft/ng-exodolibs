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

