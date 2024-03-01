import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExodoTooltipDirective} from "./exodo-tooltip.directive";
@NgModule({
  declarations: [
    ExodoTooltipDirective,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExodoTooltipDirective,
  ]
})
export class DirectivesModule { }
