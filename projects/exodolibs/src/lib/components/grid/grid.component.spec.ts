import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExodoGridComponent } from './grid.component';
import { ExodoPaginationComponent } from '../pagination/pagination.component';
import { GridService } from './grid.service';
import { CommonModule } from '@angular/common';

describe('ExodoGridComponent', () => {
  let component: ExodoGridComponent;
  let fixture: ComponentFixture<ExodoGridComponent>;

  beforeEach(async () => {
    const gridServiceMock = {
      getUniqueId: (prefix: string) => 'test-uuid-123',
      filterItems: () => {}
    } as any as GridService;

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [ExodoGridComponent, ExodoPaginationComponent],
      providers: [ { provide: GridService, useValue: gridServiceMock } ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExodoGridComponent);
    component = fixture.componentInstance;
    // set minimal inputs
    component.columns = [{ text: 'ID', dataIndex: 'id' } as any];
    component.dataSource = { rows: [], dataRecords: null } as any;
    component.mode = 'local';
    // The component sets `isAfterViewInit` inside ngAfterViewInit using setTimeout.
    // Tests run synchronously, so force it to true here to render the table body/empty message.
    (component as any).isAfterViewInit = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty message when no rows', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Sin datos');
  });

  it('should build header rows for nested columns', () => {
    const cols: any[] = [
      { text: 'A', children: [ { text: 'A1', dataIndex: 'a1' }, { text: 'A2', dataIndex: 'a2' } ] },
      { text: 'B', dataIndex: 'b' }
    ];
    const rows = (component as any).buildHeaderRows(cols);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].length).toBe(2);
    expect(rows[1].length).toBe(2);
    const parentA = rows[0][0];
    expect(parentA.colspan).toBe(2);
  });

  it('should collect leaf columns in order', () => {
    const cols: any[] = [
      { text: 'A', children: [ { text: 'A1', dataIndex: 'a1' }, { text: 'A2', dataIndex: 'a2' } ] },
      { text: 'B', dataIndex: 'b' }
    ];
    const leaves = (component as any).collectLeafColumns(cols);
    expect(leaves.map((l: any) => l.dataIndex)).toEqual(['a1', 'a2', 'b']);
  });

  it('should sort rows locally respecting sortable flag', () => {
    component.allowSorting = true;
    component.dataSource = { rows: [ { id: 2, name: 'B' }, { id: 1, name: 'A' } ], dataRecords: null } as any;
    const col: any = { text: 'Name', dataIndex: 'name', sortable: true };
    component.sort(col);
    expect(component.dataSource.rows[0].name).toBe('A');

    component.dataSource = { rows: [ { id: 2, name: 'B' }, { id: 1, name: 'A' } ], dataRecords: null } as any;
    const colNoSort: any = { text: 'Name', dataIndex: 'name', sortable: false };
    component.sort(colNoSort);
    expect(component.dataSource.rows[0].name).toBe('B');
  });

});
