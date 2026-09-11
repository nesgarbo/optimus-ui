import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { updatePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';
import Lara from '@openng/optimus-ui-themes/lara';
import Material from '@openng/optimus-ui-themes/material';
import Nora from '@openng/optimus-ui-themes/nora';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { HomeCodeComponent } from './homecode.component';
import { CONTAINER, EYEBROW, HEADING, LEDE, SECTION, TWO_COLUMNS } from './sectionshell';

const PRESETS: Record<string, { preset: any; dot: string }> = {
    Aura: { preset: Aura, dot: '#6366f1' },
    Lara: { preset: Lara, dot: '#3b82f6' },
    Nora: { preset: Nora, dot: '#10b981' },
    Material: { preset: Material, dot: '#a855f7' }
};

/** Each chip cycles its own token, so the dialog next to it restyles as you click. */
const TOKENS = {
    radius: ['0.5rem', '0.25rem', '1rem', '0'],
    primary: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'],
    padding: ['1.25rem', '0.75rem', '1.75rem'],
    fontSize: ['14px', '13px', '16px']
};

/**
 * Design tokens, edited in place.
 *
 * The dialog is a real one, annotated the way a design tool annotates a selection: a chip
 * per token with the value it currently holds. Clicking a chip cycles that token, the
 * dialog restyles, and the preset on the right rewrites itself to match — the code is
 * what you would paste into your own application.
 */
@Component({
    selector: 'theming-section',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, HomeCodeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section + ' section-alt'" aria-labelledby="theming-heading">
            <div [class]="container">
                <span [class]="eyebrow">Theming</span>
                <h2 id="theming-heading" [class]="heading">Your Design System</h2>
                <p [class]="lede">Powered by a multi-layered design token architecture. Customize colors, spacing, radius and more with a single preset or an override per component.</p>

                <div [class]="'mt-12 ' + columns">
                    <!-- The dialog, annotated like a selection on a canvas -->
                    <div class="min-w-0">
                        <div class="theming-stage relative px-6 py-10 sm:px-12" [style]="tokenStyle()">
                            <button type="button" [class]="chip + ' -top-0 start-4 sm:start-8 ' + chipViolet" (click)="cycle('radius')" [attr.aria-label]="'Radius, currently ' + token.radius() + '. Click to change.'">
                                radius: {{ token.radius() }}
                            </button>
                            <button type="button" [class]="chip + ' -top-0 end-4 sm:end-8 ' + chipIndigo" (click)="cycle('primary')" [attr.aria-label]="'Primary colour, currently ' + token.primary() + '. Click to change.'">
                                primary: {{ token.primary() }}
                            </button>
                            <button type="button" [class]="chip + ' top-1/2 -translate-y-1/2 start-0 sm:-start-2 ' + chipRose" (click)="cycle('padding')" [attr.aria-label]="'Padding, currently ' + token.padding() + '. Click to change.'">
                                padding: {{ token.padding() }}
                            </button>
                            <button type="button" [class]="chip + ' -bottom-0 end-8 sm:end-16 ' + chipEmerald" (click)="cycle('fontSize')" [attr.aria-label]="'Font size, currently ' + token.fontSize() + '. Click to change.'">
                                fontSize: {{ token.fontSize() }}
                            </button>

                            <!-- Selection frame -->
                            <div class="relative">
                                <span class="pointer-events-none absolute -top-1.5 -start-1.5 z-10 size-2.5 rounded-full border-2 border-blue-500 bg-surface-0" aria-hidden="true"></span>
                                <span class="pointer-events-none absolute -top-1.5 -end-1.5 z-10 size-2.5 rounded-full border-2 border-blue-500 bg-surface-0" aria-hidden="true"></span>
                                <span class="pointer-events-none absolute -bottom-1.5 -start-1.5 z-10 size-2.5 rounded-full border-2 border-blue-500 bg-surface-0" aria-hidden="true"></span>
                                <span class="pointer-events-none absolute -bottom-1.5 -end-1.5 z-10 size-2.5 rounded-full border-2 border-blue-500 bg-surface-0" aria-hidden="true"></span>

                                <p-dialog
                                    header="Edit Profile"
                                    [(visible)]="dialogVisible"
                                    [modal]="false"
                                    [closable]="false"
                                    [draggable]="false"
                                    [resizable]="false"
                                    appendTo="self"
                                    [focusOnShow]="false"
                                    [focusTrap]="false"
                                    [autoZIndex]="false"
                                    [maskStyle]="stageMaskStyle"
                                    [style]="stageDialogStyle"
                                >
                                    <ng-template #header>
                                        <div class="flex w-full items-start justify-between gap-4">
                                            <div>
                                                <div class="font-medium text-surface-900 dark:text-surface-0">Edit Profile</div>
                                                <p class="mt-1 text-sm text-muted-color">Update your account details.</p>
                                            </div>
                                            <p-button icon="pi pi-user" severity="secondary" [text]="true" ariaLabel="Change avatar" />
                                        </div>
                                    </ng-template>

                                    <div class="flex flex-col gap-4">
                                        <div class="flex flex-col gap-2">
                                            <label for="theming-name" class="text-sm text-muted-color">Name</label>
                                            <input id="theming-name" pInputText [(ngModel)]="name" class="w-full" />
                                        </div>
                                        <div class="flex flex-col gap-2">
                                            <label for="theming-email" class="text-sm text-muted-color">Email</label>
                                            <input id="theming-email" pInputText [(ngModel)]="email" class="w-full" />
                                        </div>
                                    </div>

                                    <ng-template #footer>
                                        <p-button label="Save Changes" />
                                        <p-button label="Cancel" severity="secondary" [outlined]="true" />
                                    </ng-template>
                                </p-dialog>
                            </div>
                        </div>

                        <!-- Presets -->
                        <div class="mt-8 flex flex-wrap items-center gap-2">
                            @for (name of presetNames; track name) {
                                <button
                                    type="button"
                                    class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                                    [class]="preset() === name ? 'border-primary text-surface-900 dark:text-surface-0' : 'border-transparent text-muted-color hover:text-surface-900 dark:hover:text-surface-0'"
                                    [attr.aria-pressed]="preset() === name"
                                    (click)="selectPreset(name)"
                                >
                                    <span class="size-2 rounded-full" [style.background]="presets[name].dot" aria-hidden="true"></span>
                                    {{ name }}
                                </button>
                            }
                        </div>
                    </div>

                    <div class="min-w-0 overflow-hidden rounded-xl border border-surface bg-surface-0 dark:bg-surface-900">
                        <home-code [source]="code()" [lineNumbers]="true" />
                    </div>
                </div>
            </div>
        </section>
    `
})
export class ThemingSectionComponent {
    readonly section = SECTION;
    readonly container = CONTAINER;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly columns = TWO_COLUMNS;

    readonly presets = PRESETS;

    readonly presetNames = Object.keys(PRESETS);

    /** The annotation chips: one shape, four accents. */
    readonly chip = 'absolute z-20 cursor-pointer rounded px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap';
    readonly chipViolet = 'bg-violet-500/15 text-violet-600 dark:text-violet-300';
    readonly chipIndigo = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300';
    readonly chipRose = 'bg-rose-500/15 text-rose-600 dark:text-rose-300';
    readonly chipEmerald = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300';

    name = 'John Doe';

    email = 'john@example.com';

    preset = signal('Aura');

    token = {
        radius: signal(TOKENS.radius[0]),
        primary: signal(TOKENS.primary[0]),
        padding: signal(TOKENS.padding[0]),
        fontSize: signal(TOKENS.fontSize[0])
    };

    /** The stage keeps the dialog open; it is the subject of the section. */
    dialogVisible = true;

    /*
     * The dialog is shown in place rather than as an overlay, so the reader can watch it
     * restyle without a modal covering the page. Both of these have to be bindings: the
     * component writes `position: fixed` on the mask as an inline style, which no
     * stylesheet of ours can outrank. It also does not take focus: it is open for the
     * whole life of the page, and focusing it would scroll the visitor straight past the
     * hero on load.
     */
    readonly stageMaskStyle = { position: 'static', height: 'auto', width: '100%', display: 'block' };

    readonly stageDialogStyle = { width: '100%', maxHeight: 'none', boxShadow: 'none' };

    /**
     * Token overrides are scoped to the stage, so the rest of the page is untouched.
     *
     * The component tokens are listed one by one on purpose: the theme generator resolves
     * `{primary.color}` when it builds the stylesheet, so a component ends up with the
     * literal colour and overriding the semantic variable alone would change nothing.
     */
    tokenStyle = computed(() => ({
        '--p-primary-color': this.token.primary(),
        '--p-primary-hover-color': this.token.primary(),
        '--p-primary-active-color': this.token.primary(),
        '--p-primary-contrast-color': '#ffffff',
        '--p-button-primary-background': this.token.primary(),
        '--p-button-primary-hover-background': this.token.primary(),
        '--p-button-primary-active-background': this.token.primary(),
        '--p-button-primary-border-color': this.token.primary(),
        '--p-button-primary-hover-border-color': this.token.primary(),
        '--p-button-primary-active-border-color': this.token.primary(),
        '--p-button-primary-color': '#ffffff',
        '--p-button-primary-hover-color': '#ffffff',
        '--p-button-primary-active-color': '#ffffff',
        '--p-inputtext-focus-border-color': this.token.primary(),
        '--p-border-radius-md': this.token.radius(),
        '--p-inputtext-border-radius': this.token.radius(),
        '--p-button-border-radius': this.token.radius(),
        '--p-dialog-border-radius': this.token.radius(),
        '--p-inputtext-padding-x': this.token.padding(),
        '--p-inputtext-padding-y': `calc(${this.token.padding()} / 2)`,
        '--p-button-padding-x': this.token.padding(),
        '--p-inputtext-font-size': this.token.fontSize(),
        '--p-button-font-size': this.token.fontSize()
    }));

    code = computed(() => {
        const name = this.preset();

        return `import { definePreset } from '@openng/optimus-ui-themes'
import ${name} from '@openng/optimus-ui-themes/${name.toLowerCase()}'

const MyPreset = definePreset(${name}, {
  semantic: {
    primary: { 500: '${this.token.primary()}' },
    formField: {
      borderRadius: '${this.token.radius()}',
      paddingX: '${this.token.padding()}',
      fontSize: '${this.token.fontSize()}'
    }
  }
})`;
    });

    cycle(key: keyof typeof TOKENS) {
        const values = TOKENS[key];
        const next = values[(values.indexOf(this.token[key]()) + 1) % values.length];

        this.token[key].set(next);
    }

    selectPreset(name: string) {
        this.preset.set(name);
        updatePreset(PRESETS[name].preset);
    }
}
