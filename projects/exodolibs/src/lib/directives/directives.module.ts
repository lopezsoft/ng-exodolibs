import { NgModule } from '@angular/core';
import { ExodoTooltipDirective } from './exodo-tooltip.directive';
import { ExodoCustomHtmlDirective } from './exodo-custom-html.directive';

@NgModule({
  declarations: [
    ExodoTooltipDirective,
    ExodoCustomHtmlDirective
  ],
  exports: [
    ExodoTooltipDirective,
    ExodoCustomHtmlDirective
  ]
})
export class DirectivesModule { }
