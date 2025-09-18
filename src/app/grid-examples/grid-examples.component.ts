import { Component, OnInit } from '@angular/core';
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
  currentLang = 'en';

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
  }

  changeLang(lang: string) {
    this.currentLang = lang;
  }

  toggleModernTheme(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const cls = 'exodo-theme-modern';
    if (checked) { document.body.classList.add(cls); }
    else { document.body.classList.remove(cls); }
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
