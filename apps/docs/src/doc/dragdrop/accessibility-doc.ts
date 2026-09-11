import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            Drag and drop is a pointer gesture, and neither directive announces it. Give the source and the target accessible names that say what is being moved and where, and announce the result of a drop in a live region so the operation is not
            silent.
        </p>

        <h3>Keyboard Support</h3>
        <p>
            The directives add no key bindings: a drag cannot be started from the keyboard. Every drag and drop operation therefore needs an equivalent path that can be reached with a keyboard — a move up/move down control, a menu, or a form — or the
            feature is unavailable to anyone who does not use a pointer.
        </p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
