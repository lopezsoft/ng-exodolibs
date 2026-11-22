import { NgModule } from '@angular/core';
import { ExodoGridModule } from './components/grid/grid.module';
import { DirectivesModule } from './directives/directives.module';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
  imports: [
    ExodoGridModule,
    DirectivesModule,
    PipesModule
  ],
  exports: [
    ExodoGridModule,
    DirectivesModule,
    PipesModule
  ]
})
export class ExodolibsModule { }
