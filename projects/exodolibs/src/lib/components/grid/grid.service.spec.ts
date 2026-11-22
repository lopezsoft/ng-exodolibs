import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GridService } from './grid.service';

describe('GridService', () => {
  let service: GridService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GridService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send Accept header without invalid CORS response headers and omit null/undefined params', () => {
    service.onRefreshLoad('/api/items', {
      page: 2,
      limit: 15,
      empty: null,
      missing: undefined,
      query: 'abc'
    }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/items');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Accept')).toBe('application/json');
    expect(req.request.headers.has('Access-Control-Allow-Methods')).toBeFalse();
    expect(req.request.headers.has('Content-Type')).toBeFalse();
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('15');
    expect(req.request.params.get('query')).toBe('abc');
    expect(req.request.params.has('empty')).toBeFalse();
    expect(req.request.params.has('missing')).toBeFalse();
    req.flush({ dataRecords: { data: [] } });
  });

  it('should filter DOM table rows safely and restore display with empty string', () => {
    const tbody = document.createElement('tbody');
    tbody.innerHTML = '<tr><td>Alice</td></tr><tr><td>Bob</td></tr>';

    service.filterItems('bob', tbody);
    expect(tbody.rows[0].style.display).toBe('none');
    expect(tbody.rows[1].style.display).toBe('');

    service.filterItems('', tbody);
    expect(tbody.rows[0].style.display).toBe('');
    expect(tbody.rows[1].style.display).toBe('');

    expect(() => service.filterItems('test', null)).not.toThrow();
  });

  it('should generate unique IDs safely even with short or null prefix', () => {
    expect(service.getUniqueId('grid-').startsWith('grid-')).toBeTrue();
    expect(service.getUniqueId('a').startsWith('exodo-lib-')).toBeTrue();
    expect(service.getUniqueId(null as any).startsWith('exodo-lib-')).toBeTrue();
  });
});
