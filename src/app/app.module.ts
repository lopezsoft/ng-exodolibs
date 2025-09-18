import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridExamplesComponent } from './grid-examples/grid-examples.component';
import {ExodolibsModule} from "../../projects/exodolibs/src/lib/exodolibs.module";
import { TranslocoModule } from '@ngneat/transloco';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
    declarations: [
        AppComponent,
        GridExamplesComponent
    ],
        imports: [
            BrowserModule,
            ExodolibsModule,
            TranslocoModule
        ],
    providers: [provideHttpClient(withInterceptorsFromDi())],
    bootstrap: [AppComponent]
})
export class AppModule { }
