import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: ` <app-docsectiontext>
        <h3>Screen Reader</h3>
        <p>The directive changes where focus can go, not what is announced. It adds no roles or labels, so the container it wraps — usually a dialog or a menu — still has to carry its own.</p>

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
                        <td>Moves focus to the next focusable element, wrapping to the first one at the end of the trap.</td>
                    </tr>
                    <tr>
                        <td><i>shift</i> + <i>tab</i></td>
                        <td>Moves focus to the previous focusable element, wrapping to the last one at the start of the trap.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </app-docsectiontext>`
})
export class AccessibilityDoc {}
