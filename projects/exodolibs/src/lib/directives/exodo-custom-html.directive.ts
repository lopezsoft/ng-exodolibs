import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[elExodoCustomHtml]'
})
export class ExodoCustomHtmlDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @Input('elExodoCustomHtml') set htmlContent(content: string) {
    // Aquí es donde agregarás el contenido HTML a tu elemento
    // Asegúrate de que el contenido es seguro antes de agregarlo
    const div = this.renderer.createElement('div');
    this.renderer.setProperty(div, 'innerHTML', content);
    this.renderer.appendChild(this.el.nativeElement, div);
  }

}
