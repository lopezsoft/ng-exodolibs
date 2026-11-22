import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { TooltipDirection } from '../components/grid/model/types-model';

let nextTooltipId = 0;

@Directive({
  selector: '[exodoTooltip]',
  standalone: false
})
export class ExodoTooltipDirective implements OnInit, OnChanges, OnDestroy {
  @Input('exodoTooltip') tooltipText: string | number | null | undefined;
  /** Dirección horizontal opcional del tooltip ('left' | 'right'). */
  @Input('tooltipDirection') tooltipDirection?: TooltipDirection | null;

  public tooltipElement: HTMLElement | null = null;

  private readonly tooltipId = `exodo-tooltip-${++nextTooltipId}`;
  private readonly unlistenHostFns: Array<() => void> = [];
  private activeWindowCleanup: (() => void) | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Registrar listeners fuera de Angular Zone para evitar ciclos de detección de cambios por cada hover
    this.ngZone.runOutsideAngular(() => {
      const host = this.el.nativeElement;
      this.unlistenHostFns.push(
        this.renderer.listen(host, 'mouseenter', () => {
          if (!this.tooltipElement) {
            this.createTooltip();
          }
        }),
        this.renderer.listen(host, 'mouseleave', () => this.destroyTooltip()),
        this.renderer.listen(host, 'mousedown', () => this.destroyTooltip()),
        this.renderer.listen(host, 'focusin', () => {
          if (!this.tooltipElement) {
            this.createTooltip();
          }
        }),
        this.renderer.listen(host, 'focusout', () => this.destroyTooltip()),
        this.renderer.listen(host, 'keydown', (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            this.destroyTooltip();
          }
        })
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['tooltipText'] || !this.tooltipElement) {
      return;
    }
    const text = this.getNormalizedText();
    if (!text) {
      this.destroyTooltip();
      return;
    }
    this.renderer.setProperty(this.tooltipElement, 'textContent', text);
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
    while (this.unlistenHostFns.length > 0) {
      const unlisten = this.unlistenHostFns.pop();
      if (unlisten) {
        unlisten();
      }
    }
  }

  createTooltip(): void {
    this.destroyTooltip();

    if (!isPlatformBrowser(this.platformId) || !this.doc?.body) {
      return;
    }

    const text = this.getNormalizedText();
    if (!text) {
      return;
    }

    const tooltip = this.renderer.createElement('span') as HTMLElement;
    this.tooltipElement = tooltip;

    this.renderer.appendChild(tooltip, this.renderer.createText(text));
    this.renderer.addClass(tooltip, 'exodo-tooltip');
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.renderer.setAttribute(tooltip, 'id', this.tooltipId);

    // Heredar clase de tema del ancestro más cercano (exodo-theme-*) para consistencia visual
    const themeClass = this.findNearestThemeClass();
    if (themeClass) {
      this.renderer.addClass(tooltip, themeClass);
    }

    // Fijar position: fixed antes de medir para alinear con getBoundingClientRect() sin desfase por scroll
    this.renderer.setStyle(tooltip, 'position', 'fixed');
    this.renderer.setStyle(tooltip, 'top', '0px');
    this.renderer.setStyle(tooltip, 'left', '0px');
    this.renderer.setStyle(tooltip, 'visibility', 'hidden');
    this.renderer.setStyle(tooltip, 'pointer-events', 'none');

    this.renderer.appendChild(this.doc.body, tooltip);

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = tooltip.getBoundingClientRect();
    const viewportWidth = this.doc.defaultView?.innerWidth || this.doc.documentElement?.clientWidth || 0;
    const viewportHeight = this.doc.defaultView?.innerHeight || this.doc.documentElement?.clientHeight || 0;
    const margin = 8;
    const offset = 4;

    let top = hostPos.bottom + offset;
    if (viewportHeight > 0 && top + tooltipPos.height > viewportHeight - margin) {
      const flippedTop = hostPos.top - tooltipPos.height - offset;
      if (flippedTop >= margin) {
        top = flippedTop;
      }
    }

    let left: number;
    if (this.tooltipDirection === 'left') {
      left = hostPos.left;
    } else if (this.tooltipDirection === 'right') {
      left = hostPos.right - tooltipPos.width;
    } else {
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }

    if (viewportWidth > 0) {
      const maxLeft = Math.max(margin, viewportWidth - tooltipPos.width - margin);
      left = Math.min(Math.max(left, margin), maxLeft);
    }

    this.renderer.setStyle(tooltip, 'top', `${Math.round(top)}px`);
    this.renderer.setStyle(tooltip, 'left', `${Math.round(left)}px`);
    this.renderer.setStyle(tooltip, 'visibility', 'visible');
    this.renderer.setAttribute(this.el.nativeElement, 'aria-describedby', this.tooltipId);

    this.attachActiveWindowListeners();
  }

  destroyTooltip(): void {
    this.detachActiveWindowListeners();
    if (this.tooltipElement) {
      if (this.tooltipElement.parentNode) {
        this.renderer.removeChild(this.tooltipElement.parentNode, this.tooltipElement);
      }
      this.tooltipElement = null;
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-describedby');
    }
  }

  private getNormalizedText(): string {
    if (this.tooltipText === null || this.tooltipText === undefined) {
      return '';
    }
    const text = String(this.tooltipText);
    return text.trim().length > 0 ? text : '';
  }

  private findNearestThemeClass(): string | null {
    const host = this.el.nativeElement;
    if (!host || typeof host.closest !== 'function') {
      return null;
    }
    const themedAncestor = host.closest('[class*="exodo-theme-"]');
    if (!themedAncestor) {
      return null;
    }
    const matched = Array.from(themedAncestor.classList).find((cls) => cls.startsWith('exodo-theme-'));
    return matched ?? null;
  }

  private attachActiveWindowListeners(): void {
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      const onDismiss = () => this.destroyTooltip();
      win.addEventListener('scroll', onDismiss, { capture: true, passive: true });
      win.addEventListener('resize', onDismiss, { passive: true });
      this.activeWindowCleanup = () => {
        win.removeEventListener('scroll', onDismiss, { capture: true });
        win.removeEventListener('resize', onDismiss);
      };
    });
  }

  private detachActiveWindowListeners(): void {
    if (this.activeWindowCleanup) {
      this.activeWindowCleanup();
      this.activeWindowCleanup = null;
    }
  }
}
