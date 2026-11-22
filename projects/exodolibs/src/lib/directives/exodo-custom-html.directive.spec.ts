import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectivesModule } from './directives.module';

@Component({
  template: `<div [elExodoCustomHtml]="content"></div>`,
  standalone: false
})
class TestCustomHtmlHostComponent {
  content: string | null = '<span class="ok">Hola</span>';
}

describe('ExodoCustomHtmlDirective', () => {
  let fixture: ComponentFixture<TestCustomHtmlHostComponent>;
  let host: TestCustomHtmlHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectivesModule],
      declarations: [TestCustomHtmlHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestCustomHtmlHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should sanitize XSS payloads before inserting HTML', () => {
    host.content = '<img src="x" onerror="window.__customHtmlXss=1"><b class="safe">Texto</b>';
    fixture.detectChanges();

    const hostDiv = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(hostDiv.innerHTML).not.toContain('onerror');
    expect(hostDiv.querySelector('b.safe')?.textContent).toBe('Texto');
    expect((window as any).__customHtmlXss).toBeUndefined();
  });

  it('should reuse the same container div across updates without leaking DOM nodes', () => {
    const hostDiv = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(hostDiv.children.length).toBe(1);

    host.content = '<span>Uno</span>';
    fixture.detectChanges();
    host.content = '<span>Dos</span>';
    fixture.detectChanges();
    host.content = null;
    fixture.detectChanges();

    expect(hostDiv.children.length).toBe(1);
    expect(hostDiv.textContent).toBe('');
  });

  it('should clean up container element on destroy', () => {
    const hostDiv = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(hostDiv.children.length).toBe(1);

    fixture.destroy();
    expect(hostDiv.children.length).toBe(0);
  });
});
