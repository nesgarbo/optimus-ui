import { Component, signal, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Signature } from '@openng/optimus-ui/signature';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'basic-doc',
    standalone: true,
    imports: [Signature, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                Draw with the pointer. The value is the signature as a PNG data URL, <i>null</i> while the pad is empty. <i>clear</i>, <i>undo</i>, <i>redo</i>, <i>canUndo</i>, <i>canRedo</i>, <i>isEmpty</i>, <i>save</i>, <i>getSignature</i> and
                <i>saveAsBlob</i> are methods of the component. With the pad focused, Ctrl/Cmd+Z undoes, Ctrl/Cmd+Shift+Z redoes and Delete clears.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-signature #pad [(value)]="value" />
            <div class="flex gap-2">
                <p-button label="Undo" severity="secondary" size="small" [disabled]="!pad.canUndo()" (onClick)="pad.undo()" />
                <p-button label="Redo" severity="secondary" size="small" [disabled]="!pad.canRedo()" (onClick)="pad.redo()" />
                <p-button label="Clear" severity="secondary" size="small" [disabled]="pad.isEmpty()" (onClick)="pad.clear()" />
                <p-button label="Save as PNG" size="small" [disabled]="pad.isEmpty()" (onClick)="pad.save('png', 'signature')" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {
    value = signal<string | null>(null);
}
