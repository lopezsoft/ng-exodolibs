import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {ExodolibsModule} from "../../projects/exodolibs/src/lib/exodolibs.module";
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ExodolibsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
