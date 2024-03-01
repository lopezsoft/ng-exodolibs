import { NgModule } from '@angular/core';
import {ExodoGridModule} from "./components/grid/grid.module";
import {DirectivesModule} from "./directives/directives.module";

@NgModule({
  imports: [
    ExodoGridModule,
    DirectivesModule
  ],
  exports: [
    ExodoGridModule,
    DirectivesModule
  ]
})
export class ExodolibsModule { }
