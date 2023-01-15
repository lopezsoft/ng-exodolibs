# Exodolibs

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.0.

## Code scaffolding

Run `ng generate component component-name --project exodolibs` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project exodolibs`.
> Note: Don't forget to add `--project exodolibs` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build exodolibs` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build exodolibs`, go to the dist folder `cd dist/exodolibs` and run `npm publish`.

## Running unit tests

Run `ng test exodolibs` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# Librería Github User Widget

Muestra la información de un usuario de Github haciendo uso de la librería de la API. La librería está desarrollada en Angular.

## Instrucciones

Hay que seguir las siguientes instrucciones para un correcto uso de la librería

### Instalación

```npm install github-user-widget```

### Configuración

En el app.module.ts (por defecto) tenemos que importar el módulo de la librería **"GithubUserWidgetModule"**

```
import { GithubUserWidgetModule } from 'github-user-widget';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GithubUserWidgetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
### Añadir estilos
En src/styles de la app principal importamos
```
@import './../node_modules/github-user-widget/lib/assets/styles/styles.css';
```
### Uso
* Con buscador
```
<guw-buscador-usuario></guw-buscador-usuario>
```

* Sin buscador
```
<guw-usuario [busqueda]="<usuario_a_buscar>"></guw-usuario>
```
