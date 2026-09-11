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
                The scrolling transcript is a <i>log</i> with <i>aria-live="polite"</i> and <i>aria-relevant="additions text"</i>, so an answer that grows in place is announced as it grows rather than only when it is finished. Two further live
                regions carry the things that are not in the transcript at all: a polite <i>status</i> for a prompt sent, an answer complete or stopped, and an assertive <i>alert</i> for a file the rules turned away.
            </p>
            <p>
                The view switcher is a <i>tablist</i> whose <i>aria-controls</i> names the panel actually rendered. Every icon-only control — send, stop, the microphone, the paperclip, copy, the feedback pair, the response navigator — carries an
                <i>aria-label</i>, and the toggling ones carry <i>aria-pressed</i>. A reasoning panel's header is a button with <i>aria-expanded</i> pointing at the panel it folds.
            </p>
            <p>The copy entry's accessible name becomes <i>Copied</i> for a moment after it fires: a colour flash is the usual feedback and a screen reader cannot see one.</p>

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
                            <td>Moves through the header, the transcript's controls, the editor and the composer's buttons in that order.</td>
                        </tr>
                        <tr>
                            <td><i>enter</i></td>
                            <td>Sends the prompt, under the default <i>sendTrigger</i>. Confirms a prompt being rewritten.</td>
                        </tr>
                        <tr>
                            <td><i>shift</i> + <i>enter</i></td>
                            <td>Breaks the line instead of sending.</td>
                        </tr>
                        <tr>
                            <td><i>ctrl</i>/<i>cmd</i> + <i>enter</i></td>
                            <td>Sends the prompt when <i>sendTrigger</i> is <i>ctrlEnter</i>.</td>
                        </tr>
                        <tr>
                            <td><i>escape</i></td>
                            <td>Abandons a prompt being rewritten.</td>
                        </tr>
                        <tr>
                            <td><i>left</i> / <i>right</i></td>
                            <td>Moves between view tabs while the switcher has focus.</td>
                        </tr>
                        <tr>
                            <td><i>home</i> / <i>end</i></td>
                            <td>Moves to the first or last view tab.</td>
                        </tr>
                        <tr>
                            <td><i>space</i> / <i>enter</i></td>
                            <td>Activates the focused toolbar entry, suggestion chip or reasoning panel header.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3>Motion</h3>
            <p>
                The streaming caret, the reasoning pulse and the typing dots all stop under <i>prefers-reduced-motion</i>, and the transcript's follow-the-bottom scrolling becomes an instant jump rather than a smooth one. Nothing conveys meaning
                through motion alone: a running reasoning panel says so in its heading as well as in its pulse.
            </p>
        </app-docsectiontext>
    `
})
export class AccessibilityDoc {}
