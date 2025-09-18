import { Component, OnInit, Inject, Optional } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-examples',
  templateUrl: './grid-examples.component.html',
  styleUrls: ['./grid-examples.component.scss'],
  // Not standalone: AppModule declares this component so it can use the application-provided
  // modules (ExodolibsModule, TranslocoModule) without importing the packaged library here.
})
export class GridExamplesComponent implements OnInit {
  columns: any[] = [
    { text: 'ID', dataIndex: 'id', width: '64px' },
    { text: 'Name', dataIndex: 'name' },
    { text: 'Email', dataIndex: 'email' }
  ];

  // Static data example
  staticDataSource: any = {
    rows: [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
      { id: 3, name: 'Carol', email: 'carol@example.com' }
    ],
    dataRecords: {
      current_page: 1,
      from: 1,
      last_page: 1,
      to: 3,
      total: 3,
      per_page: 10,
      data: []
    }
  };

  // Dynamic (simulated API) data
  apiDataSource: any = { rows: [], dataRecords: null };
  loading = false;
  // Transloco
  languages = ['en', 'es'];
  currentLang = 'es';
  // Themes: 'light' means default (no class), others map to body classes
  themes = ['light', 'modern', 'dark', 'glacial', 'sky', 'bone','gray'];
  currentTheme = 'light';

  proxy: any = {
    api: {
      read: 'https://jsonplaceholder.typicode.com/users'
    }
  };

  paginationLabels = {
    first: 'First',
    previous: 'Previous',
    page: 'Página',
    of: 'de',
    next: 'Next',
    last: 'Last',
    refresh: 'Refresh',
    infoTemplate: '{{from}} - {{to}} de {{total}}'
  };

  // Local fallback translations used when Transloco is not available in the workspace.
  translations: Record<string, any> = {
    en: {
      examples: {
        title: 'Grid examples',
        static: 'Static data',
        api: 'Simulated API (delayed)',
        useModern: 'Use modern theme'
      }
    },
    es: {
      examples: {
        title: 'Ejemplos de Grid',
        static: 'Datos estáticos',
        api: 'API simulada (con delay)',
        useModern: 'Usar tema moderno'
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
    // Simulate an API call with delay
    this.loading = true;
    of([
      { id: 11, name: 'Xavier', email: 'xavier@example.com' },
      { id: 12, name: 'Yara', email: 'yara@example.com' },
      { id: 13, name: 'Zoe', email: 'zoe@example.com' }
    ]).pipe(delay(1200)).subscribe(rows => {
      this.apiDataSource.rows = rows;
      this.apiDataSource.dataRecords = {
        current_page: 1,
        from: 1,
        last_page: 1,
        to: rows.length,
        total: rows.length,
        per_page: 10,
        data: rows
      };
      this.loading = false;
    });

    // nothing else needed; translations are local
    // Load saved theme and language preference
    this.loadTheme();
    this.loadLang();
  }

  dataAdapter(response: any[], params: any): any {
    const page = params.page || 1;
    const perPage = 10; // O lo puedes pasar en los parámetros
    const total = response.length;
    const lastPage = Math.ceil(total / perPage);

    // Cortar el array para obtener solo los datos de la página actual
    const paginatedData = response.slice((page - 1) * perPage, page * perPage);

    const dataRecords = {
      total: total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
      from: (page - 1) * perPage + 1,
      to: (page - 1) * perPage + paginatedData.length,
      data: paginatedData
    };

    return {
      success: true,
      message: 'Datos cargados y paginados en el cliente',
      dataRecords: dataRecords
    };
  }

  changeLang(lang: string) {
    this.currentLang = lang;
    try { localStorage.setItem('exodo_lang', lang); } catch (e) { /* ignore */ }
  }

  // Apply theme by name and persist selection
  changeTheme(theme: string) {
    this.currentTheme = theme;
    // Persist selection; theme is applied locally in the template as a class binding
    try { localStorage.setItem('exodo_theme', theme); } catch (e) { /* ignore */ }
  }

  // Backwards-compatible toggle for the single-checkbox UI (kept for compatibility)
  toggleModernTheme(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const theme = checked ? 'modern' : 'light';
    this.changeTheme(theme);
  }

  private applyTheme(theme: string) {
    // Deprecated: theming is applied per-grid in the demo template via class bindings.
    // Keep method for backwards compatibility, but do not touch global document.
    return;
  }

  private loadTheme() {
    try {
      const saved = localStorage.getItem('exodo_theme');
      if (saved && this.themes.includes(saved)) {
        this.currentTheme = saved;
      }
    } catch (e) { /* ignore */ }
  }

  private loadLang() {
    try {
      const saved = localStorage.getItem('exodo_lang');
      if (saved && this.languages.includes(saved)) {
        this.currentLang = saved;
      }
    } catch (e) { /* ignore */ }
  }

  t(path: string) {
    const parts = path.split('.');
    let node: any = this.translations[this.currentLang] || {};
    for (const p of parts) {
      node = node?.[p];
      if (node === undefined) { return path; }
    }
    return node;
  }
}
