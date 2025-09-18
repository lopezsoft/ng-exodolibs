# NgExodolibs

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.10.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Nota sobre Traducciones (Transloco)

Esta workspace mantiene `@ngneat/transloco` en `devDependencies` del proyecto raíz para facilitar el desarrollo y las demos locales (por ejemplo, los ejemplos en `src/app` utilizan Transloco). Sin embargo, la librería `exodolibs` declara `@ngneat/transloco` como `peerDependency` en `projects/exodolibs/package.json`.

Consecuencia para consumidores de la librería:

- Si instalas `exodolibs` en tu proyecto y quieres aprovechar las traducciones automáticas del paginador, debes instalar y configurar `@ngneat/transloco` en tu aplicación. Por ejemplo:

```bash
npm install @ngneat/transloco
```

- Si no instalas Transloco, `exodolibs` seguirá funcionando: el paginador usará los textos por defecto o los `@Input() labels` que proveas.

Recomendación: mantener Transloco como dependencia de la aplicación que consuma `exodolibs` para controlar el sistema de traducciones y evitar conflictos de versión.
