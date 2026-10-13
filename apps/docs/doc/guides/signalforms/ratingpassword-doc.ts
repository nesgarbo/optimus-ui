import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Code } from '@/domain/code';
import { Component, signal } from '@angular/core';
import { disabled, form, FormField, min, minLength, required } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { FieldErrorModule } from '@openng/optimus-ui/fielderror';
import { PasswordModule } from '@openng/optimus-ui/password';
import { RatingModule } from '@openng/optimus-ui/rating';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';

@Component({
    selector: 'ratingpassword-doc',
    standalone: true,
    imports: [FormField, RatingModule, PasswordModule, FieldErrorModule, ToggleSwitchModule, FormsModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>
                <i>p-rating</i> and <i>p-password</i> are fields of a signal form like any other control. A click on a star sets the number of the model, the same star again clears it to <i>null</i>, and typing in the password writes the string. Both
                mark the field as touched when the user leaves them, take <i>disabled</i> from the form, and show the errors of the rules with <i>pFieldError</i>.
            </p>
        </app-docsectiontext>
        <div class="card flex flex-col gap-4 max-w-sm">
            <p-rating id="sf-rating" [formField]="f.stars" pFieldError />
            <p-password id="sf-password" [formField]="f.password" [toggleMask]="true" pFieldError autocomplete="off" />
            <label class="flex items-center gap-2"><p-toggleswitch id="sf-lock" [ngModel]="locked()" (ngModelChange)="locked.set($event)" /> Lock the form</label>
            <span id="sf-model">{{ model().stars }} / {{ model().password }}</span>
        </div>
        <app-code [code]="code" selector="ratingpassword-doc"></app-code>
    `
})
export class RatingPasswordDoc {
    locked = signal(false);

    model = signal<{ stars: number | null; password: string }>({ stars: null, password: '' });

    f = form(this.model, (path) => {
        required(path.stars);
        min(path.stars, 3, { message: 'Rate with 3 stars or more' });
        required(path.password);
        minLength(path.password, 8);
        disabled(path.stars, () => this.locked());
        disabled(path.password, () => this.locked());
    });

    code: Code = {
        html: `<p-rating [formField]="f.stars" pFieldError />
<p-password [formField]="f.password" [toggleMask]="true" pFieldError autocomplete="off" />`,
        typescript: `import { Component, signal } from '@angular/core';
import { form, FormField, min, minLength, required } from '@angular/forms/signals';
import { FieldErrorModule } from '@openng/optimus-ui/fielderror';
import { PasswordModule } from '@openng/optimus-ui/password';
import { RatingModule } from '@openng/optimus-ui/rating';

@Component({
    selector: 'ratingpassword-doc',
    templateUrl: './ratingpassword-doc.html',
    standalone: true,
    imports: [FormField, RatingModule, PasswordModule, FieldErrorModule]
})
export class RatingPasswordDoc {
    model = signal<{ stars: number | null; password: string }>({ stars: null, password: '' });

    f = form(this.model, (path) => {
        required(path.stars);
        min(path.stars, 3, { message: 'Rate with 3 stars or more' });
        required(path.password);
        minLength(path.password, 8);
    });
}`
    };
}
