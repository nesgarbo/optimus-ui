import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>
            A dialog opened through the service is the same overlay as <i>p-dialog</i>: the root has <i>role="dialog"</i> with <i>aria-modal</i>, focus moves inside when it opens and returns to the element that opened it when it closes. Pass a
            <i>header</i> so the dialog has an accessible name, and prefer it over a title rendered inside the content.
        </p>

        <h3>Keyboard Support</h3>
        <div class="doc-tablewrapper">
            <table class="doc-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Function</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><i>tab</i></td>
                        <td>Moves focus to the next focusable element inside the dialog.</td>
                    </tr>
                    <tr>
                        <td><i>shift</i> + <i>tab</i></td>
                        <td>Moves focus to the previous focusable element inside the dialog.</td>
                    </tr>
                    <tr>
                        <td><i>escape</i></td>
                        <td>Closes the dialog, unless it was opened with <i>closeOnEscape</i> disabled.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
