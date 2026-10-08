import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';

@Component({
    selector: 'labels-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>padLabel</i> is the accessible name of the pad when no <i>aria-label</i> is set (<i>Signature pad</i>), and <i>emptyLabel</i> and <i>signedLabel</i> are its description while it holds nothing (<i>Empty</i>) or a signature
                (<i>Signed</i>). Set them to translate what a screen reader says.
            </p>
            <p>
                Writing the PNG to <i>value</i> after each stroke is costly on a large pad. <i>valueDebounce</i> is the milliseconds to wait after the last stroke: the strokes of that time are joined into one encoding, which also runs when the pad
                loses focus. The default, <i>0</i>, encodes right away.
            </p>
            <p>
                <i>delete</i> and <i>backspace</i> clear the pad, and that can be undone: <i>undo()</i>, or <i>ctrl + z</i>, brings back what was on it, strokes and redo history included. <i>canUndo</i> tells whether there is something to take back
                or to restore.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>
    `
})
export class LabelsDoc {
    code: Code = {
        html: `<p-signature padLabel="Firma del cliente" emptyLabel="Vacía" signedLabel="Firmada" [valueDebounce]="300" [(ngModel)]="value" />`
    };
}
