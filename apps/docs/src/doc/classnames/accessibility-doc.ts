import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>ClassNames builds a class string and renders no markup, so it carries no semantics and is invisible to assistive technology. The element you apply the result to owns its role, name and state.</p>

        <h3>Keyboard Support</h3>
        <p>The utility adds no interactive elements and no key bindings.</p>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
