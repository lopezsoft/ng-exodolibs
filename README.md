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


## Nota sobre traducciones

La librería `exodolibs` funciona sin dependencias de i18n externas. El paginador busca labels en este orden:

1. `@Input() labels` en el componente
2. `EXODO_I18N` (InjectionToken) proporcionado por la aplicación
3. Labels por defecto incluidos en la librería

Si deseas integrar un sistema de traducciones (por ejemplo `@ngneat/transloco`) puedes hacerlo en tu aplicación y exponer las traducciones a `exodolibs` mediante el proveedor `EXODO_I18N`. No es obligatorio instalar `Transloco` para usar la librería.

### Notas sobre paginación

La librería ahora soporta `limit` y `skip` como `@Input()` en el componente `exodo-grid`. Consulta `projects/exodolibs/README.md` para un ejemplo de uso.
