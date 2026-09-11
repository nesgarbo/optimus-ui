import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The directive only moves focus; it adds no roles or labels of its own, so the element it is placed on has to be labelled like any other control. Moving focus on load takes a screen reader user out of the page context they arrived in, so
            reserve it for a view whose single purpose is that field — a search page, a login form, a dialog.
        </p>

        <h3>Keyboard Support</h3>
        <p>The directive adds no key bindings. Focus lands on the element it is applied to, and the tab order continues from there.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
