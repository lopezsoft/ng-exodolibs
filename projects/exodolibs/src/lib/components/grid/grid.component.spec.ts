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

});
