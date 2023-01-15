import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExodoGridComponent } from './grid.component';
import {ExodoPaginationComponent} from '../pagination/pagination.component';
import {FormsModule} from "@angular/forms";
import {PipesModule} from "../../pipes/pipes.module";
import { GridCellComponent } from './grid-cell/grid-cell.component';


@NgModule({
  declarations: [
    ExodoGridComponent,
    ExodoPaginationComponent,
    GridCellComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    PipesModule
  ],
  exports: [
    ExodoGridComponent,
    ExodoPaginationComponent,
    GridCellComponent
  ]
})
export class ExodoGridModule { }
