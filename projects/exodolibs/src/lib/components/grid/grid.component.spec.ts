import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { ExodoGridModule } from './grid.module';
import { ExodoGridComponent } from './grid.component';
import { GridService } from './grid.service';
import { ColumnContract } from './contracts';

describe('ExodoGridComponent', () => {
  let component: ExodoGridComponent;
  let fixture: ComponentFixture<ExodoGridComponent>;
  let gridServiceSpy: jasmine.SpyObj<GridService>;

  beforeEach(async () => {
    gridServiceSpy = jasmine.createSpyObj<GridService>('GridService', [
      'getUniqueId',
      'filterItems',
      'onRefreshLoad'
    ]);
    gridServiceSpy.getUniqueId.and.callFake((prefix = '') => `${prefix || 'exodo-lib-'}test-123`);
    gridServiceSpy.onRefreshLoad.and.returnValue(of({ dataRecords: { data: [] } }));

    await TestBed.configureTestingModule({
      imports: [ExodoGridModule],
      providers: [{ provide: GridService, useValue: gridServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExodoGridComponent);
    component = fixture.componentInstance;
    component.columns = [{ text: 'ID', dataIndex: 'id' }];
    component.dataSource = { rows: [], dataRecords: null };
    component.mode = 'local';
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create and assign searchFieldId immediately', () => {
    expect(component).toBeTruthy();
    expect(component.getSearchFieldId()).toContain('exodo-grid-search-');
  });

  it('should show empty message when no rows and span all leaf columns', () => {
    component.columns = [
      {
        text: 'Grupo',
        children: [
          { text: 'A', dataIndex: 'a' },
          { text: 'B', dataIndex: 'b' }
        ]
      },
      { text: 'C', dataIndex: 'c' }
    ];
    component.rebuildGrid();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Sin datos');
    const emptyTd = el.querySelector('tbody td') as HTMLTableCellElement;
    expect(emptyTd.getAttribute('colspan')).toBe('3');
  });

  it('should build header rows for nested columns without mutating caller objects and skipping hidden columns', () => {
    const child1: ColumnContract = Object.freeze({ text: 'A1', dataIndex: 'a1' });
    const child2: ColumnContract = Object.freeze({ text: 'A2', dataIndex: 'a2' });
    const hiddenChild: ColumnContract = Object.freeze({ text: 'A3', dataIndex: 'a3', hidden: true });
    const parentA: ColumnContract = Object.freeze({ text: 'A', children: [child1, child2, hiddenChild] });
    const colB: ColumnContract = Object.freeze({ text: 'B', dataIndex: 'b' });
    const cols: ColumnContract[] = [parentA, colB];

    const rows = (component as any).buildHeaderRows(cols);
    expect(rows.length).toBe(2);
    expect(rows[0].length).toBe(2);
    expect(rows[1].length).toBe(2);
    expect(rows[0][0].colspan).toBe(2);
    expect(rows[0][1].rowspan).toBe(2);
    expect(parentA.colspan).toBeUndefined();
    expect(colB.rowspan).toBeUndefined();
  });

  it('should collect visible leaf columns in order', () => {
    const cols: ColumnContract[] = [
      { text: 'A', children: [{ text: 'A1', dataIndex: 'a1' }, { text: 'A2', dataIndex: 'a2' }] },
      { text: 'Hidden', dataIndex: 'h', hidden: true },
      { text: 'B', dataIndex: 'b' }
    ];
    const leaves = (component as any).collectLeafColumns(cols);
    expect(leaves.map((l: ColumnContract) => l.dataIndex)).toEqual(['a1', 'a2', 'b']);
  });

  it('should sort rows locally handling nulls and respecting sortable flag', () => {
    component.allowSorting = true;
    component.dataSource = {
      rows: [{ id: 2, name: 'B' }, { id: 3, name: null }, { id: 1, name: 'A' }],
      dataRecords: null
    };
    const col: ColumnContract = { text: 'Name', dataIndex: 'name', sortable: true };
    component.sort(col);
    expect(component.dataSource.rows[0].name).toBe('A');
    expect(component.dataSource.rows[1].name).toBe('B');
    expect(component.dataSource.rows[2].name).toBeNull();

    component.dataSource = { rows: [{ id: 2, name: 'B' }, { id: 1, name: 'A' }], dataRecords: null };
    const colNoSort: ColumnContract = { text: 'Name', dataIndex: 'name', sortable: false };
    component.sort(colNoSort);
    expect(component.dataSource.rows[0].name).toBe('B');
  });

  it('should filter rows locally via column filters and global search and reset via clearFilters', () => {
    component.columns = [
      { text: 'ID', dataIndex: 'id' },
      { text: 'Nombre', dataIndex: 'name' }
    ];
    component.dataSource = {
      rows: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      dataRecords: null
    };
    component.allowFiltering = true;
    component.rebuildGrid();
    fixture.detectChanges();

    component.applyGridFilter({ field: 'name', value: 'bob' });
    expect(component.displayedRows.length).toBe(1);
    expect(component.displayedRows[0].name).toBe('Bob');

    component.clearFilters();
    expect(component.displayedRows.length).toBe(2);
  });

  it('should preserve baseParams while letting pagination/sort override, pass full requestParams to dataAdapter, and cancel stale requests via switchMap', () => {
    const first$ = new Subject<any>();
    const second$ = new Subject<any>();
    gridServiceSpy.onRefreshLoad.and.returnValues(first$, second$);

    const adapterSpy = jasmine.createSpy('dataAdapter').and.callFake((resp: any) => ({
      success: true,
      message: 'ok',
      dataRecords: resp.dataRecords
    }));

    component.mode = 'remote';
    component.proxy = { api: { read: '/api/users' } };
    component.limit = 10;
    component.dataAdapter = adapterSpy;

    component.onLoad({ company_id: 7, page: 1 });
    expect(component.isLoading).toBeTrue();

    // Dispara página 2 antes de que termine la primera petición
    component.onRefreshPagination(2);

    const secondCallParams = gridServiceSpy.onRefreshLoad.calls.mostRecent().args[1];
    expect(secondCallParams['company_id']).toBe(7);
    expect(secondCallParams['page']).toBe(2);
    expect(secondCallParams['skip']).toBe(10);

    // Respuesta tardía de la primera petición debe ignorarse porque switchMap la canceló
    first$.next({ dataRecords: { data: [{ id: 999 }], current_page: 1, last_page: 2, total: 20 } });
    expect(component.dataSource.rows.length).toBe(0);

    // Respuesta de la segunda petición aplica datos y cierra spinner
    second$.next({ dataRecords: { data: [{ id: 2 }], current_page: 2, last_page: 2, total: 20 } });
    second$.complete();

    expect(component.isLoading).toBeFalse();
    expect(component.dataSource.rows).toEqual([{ id: 2 }]);
    expect(adapterSpy).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.objectContaining({ company_id: 7, page: 2, skip: 10 })
    );
  });

  it('should reset isLoading on HTTP error or EMPTY stream and emit loadError', () => {
    const errors: any[] = [];
    component.loadError.subscribe((err) => errors.push(err));
    component.mode = 'remote';
    component.proxy = { api: { read: '/api/fail' } };

    gridServiceSpy.onRefreshLoad.and.returnValue(throwError(() => new Error('Network down')));
    component.onLoad({});
    expect(component.isLoading).toBeFalse();
    expect(errors.length).toBe(1);

    gridServiceSpy.onRefreshLoad.and.returnValue(EMPTY);
    component.onLoad({});
    expect(component.isLoading).toBeFalse();
  });

  it('should apply exodo-theme-light host class when theme is light', () => {
    component.theme = 'light';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).classList.contains('exodo-theme-light')).toBeTrue();
  });
});
