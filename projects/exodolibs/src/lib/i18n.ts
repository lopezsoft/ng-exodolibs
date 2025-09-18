import { InjectionToken } from '@angular/core';

export interface ExodoI18n {
  first?: string;
  previous?: string;
  page?: string;
  of?: string;
  next?: string;
  last?: string;
  refresh?: string;
  infoTemplate?: string;
}

export const EXODO_I18N = new InjectionToken<ExodoI18n>('EXODO_I18N');

export const DEFAULT_EXODO_I18N: ExodoI18n = {
  first: 'Primera página',
  previous: 'Página anterior',
  page: 'Página',
  of: 'de',
  next: 'Siguiente página',
  last: 'Última página',
  refresh: 'Actualizar',
  infoTemplate: '{{from}} - {{to}} de {{total}}'
};
