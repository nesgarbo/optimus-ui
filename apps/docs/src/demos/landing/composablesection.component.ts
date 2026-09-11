import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HomeCodeComponent } from './homecode.component';
import { CARD, CONTAINER, EYEBROW, HEADING, LEDE, SECTION } from './sectionshell';

interface Layer {
    file: string;
    code: string;
}

/**
 * One Dialog, four levels of control. The section is the code: each tab is the shortest
 * thing you would actually write at that layer, so the difference between them is the
 * whole point and there is nothing else to read.
 */
@Component({
    selector: 'composable-section',
    standalone: true,
    imports: [CommonModule, HomeCodeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section" aria-labelledby="composable-heading">
            <div [class]="container">
                <span [class]="eyebrow">Architecture</span>
                <h2 id="composable-heading" [class]="heading">Built in Layers</h2>
                <p [class]="lede">Same Dialog, four levels of control. Pick the layer that fits.</p>

                <div [class]="'mt-12 mx-auto max-w-3xl min-w-0 overflow-hidden ' + card">
                    <div class="flex overflow-x-auto border-b border-surface" role="tablist">
                        @for (layer of layers; track layer.file) {
                            <button
                                type="button"
                                role="tab"
                                class="shrink-0 border-b-2 px-4 py-2.5 font-mono text-xs transition-colors"
                                [class]="active() === layer.file ? 'border-surface-900 text-surface-900 dark:border-surface-0 dark:text-surface-0' : 'border-transparent text-muted-color hover:text-surface-900 dark:hover:text-surface-0'"
                                [attr.aria-selected]="active() === layer.file"
                                (click)="active.set(layer.file)"
                            >
                                {{ layer.file }}
                            </button>
                        }
                    </div>

                    @for (layer of layers; track layer.file) {
                        @if (active() === layer.file) {
                            <home-code [source]="layer.code" language="html" />
                        }
                    }
                </div>
            </div>
        </section>
    `
})
export class ComposableSectionComponent {
    readonly section = SECTION;
    readonly container = CONTAINER;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly card = CARD;

    layers: Layer[] = [
        {
            file: 'headless.ts',
            code: `import { DialogModule } from '@openng/optimus-ui/dialog';

<p-dialog [(visible)]="visible">
  <ng-template #headless>
    <div class="rounded-xl bg-surface-0 p-6 shadow-xl">
      <h2>Edit Profile</h2>
      <button (click)="visible = false">Close</button>
    </div>
  </ng-template>
</p-dialog>`
        },
        {
            file: 'templated.ts',
            code: `import { DialogModule } from '@openng/optimus-ui/dialog';

<p-dialog [(visible)]="visible" [modal]="true">
  <ng-template #header>
    <span class="font-semibold">Edit Profile</span>
  </ng-template>

  <input pInputText [(ngModel)]="name" />

  <ng-template #footer>
    <p-button label="Save Changes" (onClick)="save()" />
  </ng-template>
</p-dialog>`
        },
        {
            file: 'styled.ts',
            code: `import { DialogModule } from '@openng/optimus-ui/dialog';

<p-dialog header="Edit Profile" [(visible)]="visible" [modal]="true">
  <input pInputText [(ngModel)]="name" />
</p-dialog>`
        },
        {
            file: 'passthrough.ts',
            code: `import { DialogModule } from '@openng/optimus-ui/dialog';

<p-dialog
  header="Edit Profile"
  [(visible)]="visible"
  [pt]="{
    root: { class: 'rounded-2xl border border-surface' },
    header: { class: 'px-6 py-4' }
  }"
/>`
        }
    ];

    active = signal(this.layers[0].file);
}
