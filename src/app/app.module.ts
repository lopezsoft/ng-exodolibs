import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {ExodolibsModule} from "../../projects/exodolibs/src/lib/exodolibs.module";
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        ExodolibsModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
