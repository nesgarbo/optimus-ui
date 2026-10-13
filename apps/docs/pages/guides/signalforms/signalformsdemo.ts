import { AppDoc } from '@/components/doc/app.doc';
import { BasicDoc } from '@/doc/guides/signalforms/basic-doc';
import { ControlsDoc } from '@/doc/guides/signalforms/controls-doc';
import { MigrationDoc } from '@/doc/guides/signalforms/migration-doc';
import { RatingPasswordDoc } from '@/doc/guides/signalforms/ratingpassword-doc';
import { ValidationDoc } from '@/doc/guides/signalforms/validation-doc';
import { Component } from '@angular/core';

@Component({
    selector: 'signalforms-demo',
    standalone: true,
    imports: [AppDoc],
    template: `<app-doc docTitle="Signal Forms - Optimus UI" header="Signal Forms" description="Bind Optimus UI form components to Angular signal forms with [formField]." [docs]="docs" docType="page"></app-doc>`
})
export class SignalFormsDemoComponent {
    docs = [
        { id: 'basic', label: 'Basic', component: BasicDoc },
        { id: 'validation', label: 'Validation', component: ValidationDoc },
        { id: 'ratingpassword', label: 'Rating and Password', component: RatingPasswordDoc },
        { id: 'controls', label: 'Controls', component: ControlsDoc },
        { id: 'migration', label: 'Migration', component: MigrationDoc }
    ];
}
