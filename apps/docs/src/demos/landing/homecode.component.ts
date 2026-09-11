import { HighlightService } from '@/service/highlightservice';
import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

/**
 * Read-only code sample for the home page. Both themes are baked into the markup by
 * Shiki, so switching light/dark costs nothing at runtime.
 */
@Component({
    selector: 'home-code',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div class="min-w-0 overflow-x-auto text-[12.5px] leading-relaxed" [class.code-line-numbers]="lineNumbers()" [innerHTML]="html()"></div>`
})
export class HomeCodeComponent {
    source = input.required<string>();

    language = input<string>('typescript');

    /** Numbers the lines in the gutter, the way an editor would. */
    lineNumbers = input(false, { transform: booleanAttribute });

    private highlightService = inject(HighlightService);

    html = computed(() => this.highlightService.highlightSafe(this.source(), this.language()));
}
