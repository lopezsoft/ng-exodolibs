import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ExodolibsModule, ColumnContract } from 'exodolibs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-grid-examples',
  templateUrl: './grid-examples.component.html',
  styleUrls: ['./grid-examples.component.scss'],
  standalone: true,
  imports: [CommonModule, ExodolibsModule, TranslocoModule]
})
export class GridExamplesComponent implements OnInit {
  columns: ColumnContract[] = [
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

  constructor(private transloco: TranslocoService) { }

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

    // Register simple inline translations for demo
    (this.transloco as any).setTranslation('en', {
      examples: {
        title: 'Grid examples',
        static: 'Static data',
        api: 'Simulated API (delayed)',
        useModern: 'Use modern theme'
      }
    }, { merge: true });
    (this.transloco as any).setTranslation('es', {
      examples: {
        title: 'Ejemplos de Grid',
        static: 'Datos estáticos',
        api: 'API simulada (con delay)',
        useModern: 'Usar tema moderno'
      }
    }, { merge: true });
    this.transloco.setActiveLang(this.currentLang);
  }

  changeLang(lang: string) {
    this.currentLang = lang;
    this.transloco.setActiveLang(lang);
  }

  toggleModernTheme(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const cls = 'exodo-theme-modern';
    if (checked) { document.body.classList.add(cls); }
    else { document.body.classList.remove(cls); }
  }
}
