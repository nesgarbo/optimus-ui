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
                The texts for assistive technology are inputs: <i>defaultLabel</i> names the grid when there is no <i>aria-label</i> (<i>Dashboard</i>), <i>helpText</i> explains the keys, and <i>movedText</i> and <i>resizedText</i> are what the live
                region announces after a move or a resize. <i>movedText</i> takes <i>&#123;title&#125;</i>, <i>&#123;row&#125;</i> and <i>&#123;col&#125;</i>, and <i>resizedText</i> takes <i>&#123;title&#125;</i>, <i>&#123;sizeX&#125;</i> and
                <i>&#123;sizeY&#125;</i>.
            </p>
            <p>
                A panel that repeats the <i>id</i> of an earlier one is renamed <i>id~2</i>, <i>id~3</i> and so on, so it keeps a place of its own on the grid. A <i>columns</i> that is not a whole number of one or more (<i>NaN</i>, zero, a negative)
                falls back to <i>12</i>.
            </p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true" [hideCodeSandbox]="true" [hideStackBlitz]="true"></app-code>
    `
})
export class LabelsDoc {
    code: Code = {
        html: `<p-dashboardlayout
    [(panels)]="panels"
    defaultLabel="Panel de control"
    helpText="Alt y las flechas mueven un panel. Mayús y las flechas lo redimensionan."
    movedText="{title} movido a la fila {row}, columna {col}"
    resizedText="{title} mide ahora {sizeX} por {sizeY}"
/>`
    };
}
