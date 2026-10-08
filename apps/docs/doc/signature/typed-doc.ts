import { Component, viewChild } from '@angular/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { Signature } from '@openng/optimus-ui/signature';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'typed-doc',
    standalone: true,
    imports: [Signature, ButtonModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p><i>draw(text, fontFamily, fontSize)</i> writes a typed signature, and <i>loadSignature(url)</i> puts an earlier one back. Both replace what is on the pad, and the pen can draw over them.</p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-signature #pad />
            <div class="flex gap-2">
                <p-button label="Type my name" severity="secondary" size="small" (onClick)="pad.draw('Ada Lovelace', 'cursive', 40)" />
            </div>
        </div>
        <app-code></app-code>
    `
})
export class TypedDoc {}
