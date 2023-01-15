import { TestBed } from '@angular/core/testing';

import { ExodolibsService } from './exodolibs.service';

describe('ExodolibsService', () => {
  let service: ExodolibsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExodolibsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
