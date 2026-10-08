import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TooltipModule } from '@openng/optimus-ui/tooltip';

@Component({
    selector: 'options-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, InputTextModule, TooltipModule],
    template: `
        <app-docsectiontext>
            <p>
                Tooltip is also configurable by using <i>tooltipOptions</i> property. With <i>escape</i> set to <i>false</i> the content is written as HTML, and that HTML is sanitized: <i>&lt;script&gt;</i>, <i>style</i> and the <i>on*</i> handlers
                are removed.
            </p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <input type="text" pInputText pTooltip="Enter your username" [tooltipOptions]="tooltipOptions" placeholder="hover to display tooltip" />
        </div>
        <app-code></app-code>
    `
})
export class OptionsDoc {
    tooltipOptions = {
        showDelay: 150,
        autoHide: false,
        tooltipEvent: 'hover',
        tooltipPosition: 'left'
    };
}
