import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            The directive toggles classes on a target element and announces nothing by itself. When it is used to show and hide a panel, the trigger needs <i>aria-expanded</i> and <i>aria-controls</i> pointing at that panel, kept in sync with the
            class it toggles — otherwise the state change is visible but not readable.
        </p>

        <h3>Keyboard Support</h3>
        <p>The directive listens for a click, which a native <i>button</i> also fires on <i>enter</i> and <i>space</i>. Applied to a non-interactive element it cannot be reached with a keyboard at all, so put it on a button or a link.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
