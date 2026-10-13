import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'accessibility-doc',
    standalone: true,
    imports: [AppDocSectionText],
    template: `
        <app-docsectiontext>
            <h3>Screen Reader</h3>
            <p>
                The grid is a <i>treegrid</i>. Each row has its <i>aria-level</i>, <i>aria-expanded</i> when it is a parent, <i>aria-selected</i> and an <i>aria-description</i> with the dates, the progress and whether it is a milestone or on the
                critical path, so the information of the chart reaches a screen reader through the grid. The chart itself is hidden from assistive technology, and edits are announced in a polite live region. The splitter is a focusable
                <i>separator</i>.
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
                            <td><i>down arrow</i>, <i>up arrow</i></td>
                            <td>Moves to the next or the previous row.</td>
                        </tr>
                        <tr>
                            <td><i>home</i>, <i>end</i></td>
                            <td>Moves to the first or the last row.</td>
                        </tr>
                        <tr>
                            <td><i>right arrow</i></td>
                            <td>Expands a collapsed parent, or moves to the first child of an expanded one.</td>
                        </tr>
                        <tr>
                            <td><i>left arrow</i></td>
                            <td>Collapses an expanded parent, or moves to the parent of a task.</td>
                        </tr>
                        <tr>
                            <td><i>enter</i>, <i>space</i></td>
                            <td>Toggles a parent, or scrolls the chart to a task.</td>
                        </tr>
                        <tr>
                            <td><i>alt + shift + right arrow</i>, <i>alt + shift + left arrow</i></td>
                            <td>Indents or outdents the task. Needs <i>allowEditing</i>.</td>
                        </tr>
                        <tr>
                            <td><i>delete</i></td>
                            <td>Deletes the task. Needs <i>allowDeleting</i>.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </app-docsectiontext>
    `
})
export class AccessibilityDoc {}
