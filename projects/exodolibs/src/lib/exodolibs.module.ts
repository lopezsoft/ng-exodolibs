import { NgModule } from '@angular/core';
import { ExodolibsComponent } from './exodolibs.component';
import {ExodoGridModule} from "./components/grid/grid.module";

@NgModule({
  declarations: [
    ExodolibsComponent
  ],
  imports: [
    ExodoGridModule
  ],
  exports: [
    ExodolibsComponent,
    ExodoGridModule,
  ]
})
export class ExodolibsModule { }
