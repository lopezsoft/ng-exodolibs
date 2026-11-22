import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridFilterModule } from './grid-filter.module';
import { GridFilterComponent } from './grid-filter.component';
import { EXODO_I18N } from '../../../i18n';

describe('GridFilterComponent', () => {
  let component: GridFilterComponent;
  let fixture: ComponentFixture<GridFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridFilterModule],
      providers: [
        { provide: EXODO_I18N, useValue: { filterBy: 'Buscar en' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GridFilterComponent);
    component = fixture.componentInstance;
  });

  it('should emit field and value on applyFilter and clear on reset', () => {
    component.column = { text: 'Nombre', dataIndex: 'name' };
    fixture.detectChanges();

    const spy = spyOn(component.onFilter, 'emit');
    component.filterValue = 'Alice';
    component.applyFilter();

    expect(spy).toHaveBeenCalledWith({ field: 'name', value: 'Alice' });
    expect(component.placeholder).toBe('Buscar en Nombre');

    component.reset();
    expect(component.filterValue).toBe('');
  });

  it('should not emit or render input when column lacks dataIndex', () => {
    component.column = { text: 'Acciones' };
    fixture.detectChanges();

    const spy = spyOn(component.onFilter, 'emit');
    component.applyFilter();

    expect(spy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });
});
