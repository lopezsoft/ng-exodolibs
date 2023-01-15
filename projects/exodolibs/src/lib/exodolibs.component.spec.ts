import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExodolibsComponent } from './exodolibs.component';

describe('ExodolibsComponent', () => {
  let component: ExodolibsComponent;
  let fixture: ComponentFixture<ExodolibsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExodolibsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExodolibsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
