import { Directive, ElementRef, Input, OnDestroy, Renderer2, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[elExodoCustomHtml]',
  standalone: false
})
export class ExodoCustomHtmlDirective implements OnDestroy {
  private containerEl: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {}

  @Input('elExodoCustomHtml') set htmlContent(content: string | null | undefined) {
    // Sanear siempre con DomSanitizer y reutilizar el mismo contenedor para evitar fugas DOM
    const sanitized = content === null || content === undefined
      ? ''
      : (this.sanitizer.sanitize(SecurityContext.HTML, String(content)) ?? '');

    if (!this.containerEl) {
      this.containerEl = this.renderer.createElement('div');
      this.renderer.appendChild(this.el.nativeElement, this.containerEl);
    }

    this.renderer.setProperty(this.containerEl, 'innerHTML', sanitized);
  }

  ngOnDestroy(): void {
    if (this.containerEl && this.containerEl.parentNode) {
      this.renderer.removeChild(this.containerEl.parentNode, this.containerEl);
    }
    this.containerEl = null;
  }
}
