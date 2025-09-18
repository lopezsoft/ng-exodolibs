import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridFilterComponent } from './grid-filter.component';

@NgModule({
  declarations: [GridFilterComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [GridFilterComponent]
})
export class GridFilterModule { }
