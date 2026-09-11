import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HomeCodeComponent } from './homecode.component';
import { CARD, CONTAINER, EYEBROW, HEADING, LEDE, SECTION, TERMINAL, TERMINAL_CODE, TWO_COLUMNS } from './sectionshell';

@Component({
    selector: 'code-section',
    standalone: true,
    imports: [CommonModule, HomeCodeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section + ' section-alt'" aria-labelledby="code-heading">
            <div [class]="container">
                <div [class]="columns">
                    <div>
                        <span [class]="eyebrow">Quick Start</span>
                        <h2 id="code-heading" [class]="heading">So simple to use</h2>
                        <p [class]="lede">Import a component, pass your data, and you have a production-ready UI. No boilerplate, no setup ceremony.</p>

                        <div [class]="'mt-8 ' + terminal">
                            <span class="me-1 font-mono text-sm text-surface-500">$</span>
                            <code [class]="terminalCode">npm install &#64;openng/optimus-ui</code>
                        </div>
                    </div>

                    <div [class]="card + ' min-w-0 overflow-hidden'">
                        <home-code [source]="code" />
                    </div>
                </div>
            </div>
        </section>
    `
})
export class CodeSectionComponent {
    readonly section = SECTION;
    readonly container = CONTAINER;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly columns = TWO_COLUMNS;
    readonly terminal = TERMINAL;
    readonly terminalCode = TERMINAL_CODE;
    readonly card = CARD;

    code = `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from '@openng/optimus-ui/slider';

@Component({
  selector: 'volume-control',
  imports: [FormsModule, SliderModule],
  template: \`
    <label for="volume">Volume</label>
    <p-slider inputId="volume" [(ngModel)]="value" />
  \`
})
export class VolumeControl {
  value = 50;
}`;
}
