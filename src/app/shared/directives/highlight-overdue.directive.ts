import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightOverdue]',
  standalone: true
})
export class HighlightOverdueDirective implements OnInit {
  @Input() appHighlightOverdue: string | null = null;
  @Input() taskStatus: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (!this.appHighlightOverdue || this.taskStatus === 'completed') {
      return;
    }

    const dueDate = new Date(this.appHighlightOverdue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', '#fee');
      this.renderer.setStyle(this.el.nativeElement, 'borderLeft', '4px solid #dc2626');
    }
  }
}
