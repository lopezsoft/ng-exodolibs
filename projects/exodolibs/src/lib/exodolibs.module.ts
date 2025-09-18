import { NgModule } from '@angular/core';
import {ExodoGridModule} from "./components/grid/grid.module";
import {DirectivesModule} from "./directives/directives.module";
import { EXODO_I18N, DEFAULT_EXODO_I18N } from './i18n';

@NgModule({
  imports: [
    ExodoGridModule,
    DirectivesModule
  ],
  providers: [
    { provide: EXODO_I18N, useValue: DEFAULT_EXODO_I18N }
  ],
  exports: [
    ExodoGridModule,
    DirectivesModule
  ]
})
export class ExodolibsModule { }
