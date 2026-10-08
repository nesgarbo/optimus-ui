import { Component, signal } from '@angular/core';
import { BlockEditor, type BlockValue } from '@openng/optimus-ui/blockeditor';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'pictures-doc',
    standalone: true,
    imports: [BlockEditor, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                The Image block opens a file picker. Without more, the picture is embedded in the document as a data URL. Give <i>uploadImage</i> a function that sends the file somewhere and returns its address, and the document holds the address.
                The menu can be changed with <i>commands</i>, and <i>readonly</i> shows the document and lets nothing be changed.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4">
            <p-blockeditor [(value)]="value" [uploadImage]="upload" (imageRequested)="log.set('Picture chosen: ' + $event.file.name)" />
            <p class="text-sm">{{ log() }}</p>
        </div>
        <app-code></app-code>
    `
})
export class PicturesDoc {
    value = signal<BlockValue>(null);

    log = signal('');

    // A real app would send the file to its server; this one keeps it in the page.
    upload = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('The picture could not be read'));
            reader.readAsDataURL(file);
        });
}
