import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeHtmlPipe(sanitizer);
  });

  it('should strip event handlers such as onerror', () => {
    const result = pipe.transform('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert(1)');
  });

  it('should neutralize javascript: URLs', () => {
    const result = pipe.transform('<a href="javascript:alert(1)">x</a>');
    expect(result).not.toContain('href="javascript:');
    expect(result).toContain('href="unsafe:javascript:');
  });

  it('should strip script tags and inline style attributes', () => {
    const result = pipe.transform('<script>alert(1)</script><span style="color:red" class="badge">ok</span>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('style=');
    expect(result).toContain('class="badge"');
    expect(result).toContain('ok');
  });

  it('should preserve safe HTML markup and classes', () => {
    const result = pipe.transform('<span class="badge">ok</span>');
    expect(result).toContain('class="badge"');
    expect(result).toContain('ok');
  });

  it('should return empty string for null or undefined and coerce primitives', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(0)).toBe('0');
    expect(pipe.transform(true)).toBe('true');
  });
});
