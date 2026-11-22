import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string | number | boolean | null | undefined): string {
    if (html === null || html === undefined) {
      return '';
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, String(html)) ?? '';
  }
}
