import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExodoGridComponent } from './grid.component';
import {ExodoPaginationComponent} from '../pagination/pagination.component';
import {FormsModule} from "@angular/forms";
import {PipesModule} from "../../pipes/pipes.module";
import { GridCellComponent } from './grid-cell/grid-cell.component';
import {DirectivesModule} from "../../directives/directives.module";
import {GridFilterModule} from "./filter/grid-filter.module";


@NgModule({
  declarations: [
    ExodoGridComponent,
    ExodoPaginationComponent,
    GridCellComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PipesModule,
    DirectivesModule,
    GridFilterModule
  ],
  exports: [
    ExodoGridComponent,
    ExodoPaginationComponent,
    GridCellComponent
  ]
})
export class ExodoGridModule { }
