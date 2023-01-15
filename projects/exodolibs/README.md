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
@import 'node_modules/exodolibs/lib/assets/styles.scss';
```
### Uso
