import { AppConfigService } from '@/service/appconfigservice';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { updatePreset, updateSurfacePalette } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';
import Lara from '@openng/optimus-ui-themes/lara';
import Material from '@openng/optimus-ui-themes/material';
import Nora from '@openng/optimus-ui-themes/nora';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { ConfirmDialogModule } from '@openng/optimus-ui/confirmdialog';
import { DrawerModule } from '@openng/optimus-ui/drawer';
import { SelectButton } from '@openng/optimus-ui/selectbutton';
import { SliderModule } from '@openng/optimus-ui/slider';
import { ToastModule } from '@openng/optimus-ui/toast';

const PRESETS: Record<string, any> = { Aura, Material, Lara, Nora };

const PRIMARY = ['#6366f1', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899'];

const SURFACES = ['slate', 'gray', 'zinc', 'neutral', 'stone'];

interface DesignerState {
    preset: string;
    primary: string;
    surface: string;
    radius: number;
    fieldPaddingY: number;
    fieldFontSize: number;
}

const DEFAULTS: DesignerState = {
    preset: 'Aura',
    primary: PRIMARY[0],
    surface: 'zinc',
    radius: 6,
    fieldPaddingY: 8,
    fieldFontSize: 14
};

/** Opening the designer from anywhere — the bar owns the button, the drawer lives here. */
@Injectable({ providedIn: 'root' })
export class AppDesignerService {
    readonly visible = signal(false);

    open() {
        this.visible.set(true);
    }

    close() {
        this.visible.set(false);
    }
}

/**
 * The theme designer.
 *
 * Everything here writes real tokens through `updatePreset`, so the site you are looking
 * at is the preview — there is no separate canvas and nothing to activate. What you end
 * up with is a preset you can copy into your own application.
 */
@Component({
    selector: 'app-designer',
    standalone: true,
    imports: [CommonModule, FormsModule, DrawerModule, ButtonModule, SelectButton, SliderModule, ToastModule, ConfirmDialogModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-drawer [visible]="designerService.visible()" (visibleChange)="onVisibleChange($event)" position="right" styleClass="designer w-screen! md:w-2xl!" appendTo="body">
            <ng-template #header>
                <div class="flex w-full items-center justify-between gap-4">
                    <span class="text-lg font-medium">Theme Designer</span>
                    <p-button [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'" severity="secondary" [text]="true" [ariaLabel]="isDarkMode() ? 'Switch to light theme' : 'Switch to dark theme'" (onClick)="toggleDarkMode()" />
                </div>
            </ng-template>

            <p class="text-sm text-(--text-secondary-color)">
                Edit the tokens below and the whole site restyles as you go — this page is the preview. Copy the preset when you are happy with it; it is plain code, and it is yours under the MIT license.
            </p>

            <div class="mt-6 flex flex-col gap-6">
                <div>
                    <span class="mb-1.5 block text-sm font-semibold text-(--text-secondary-color)">Base preset</span>
                    <p-selectbutton [options]="presetNames" [ngModel]="state().preset" (ngModelChange)="set('preset', $event)" [allowEmpty]="false" size="small" />
                </div>

                <div>
                    <span class="mb-1.5 block text-sm font-semibold text-(--text-secondary-color)">Primary</span>
                    <div class="flex flex-wrap gap-2">
                        @for (color of primaryColors; track color) {
                            <button
                                type="button"
                                class="size-5 cursor-pointer rounded-full outline-2 outline-offset-2 outline-transparent data-active:outline-primary-500/75"
                                [style.background]="color"
                                [attr.data-active]="state().primary === color ? '' : null"
                                [attr.aria-label]="'Primary ' + color"
                                (click)="set('primary', color)"
                            ></button>
                        }
                    </div>
                </div>

                <div>
                    <span class="mb-1.5 block text-sm font-semibold text-(--text-secondary-color)">Surface</span>
                    <p-selectbutton [options]="surfaces" [ngModel]="state().surface" (ngModelChange)="set('surface', $event)" [allowEmpty]="false" size="small" styleClass="w-full" />
                </div>

                @for (token of sliders; track token.key) {
                    <div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-semibold text-(--text-secondary-color)">{{ token.label }}</span>
                            <span class="font-mono text-xs text-(--text-color)">{{ state()[token.key] }}px</span>
                        </div>
                        <p-slider class="mt-2 block" [ngModel]="state()[token.key]" (ngModelChange)="set(token.key, $event)" [min]="token.min" [max]="token.max" />
                    </div>
                }
            </div>

            <div class="mt-8 overflow-hidden rounded-md border border-(--border-color)">
                <pre class="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-(--text-secondary-color)">{{ code() }}</pre>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
                <p-button label="Copy preset" icon="pi pi-copy" (onClick)="copy()" />
                <p-button label="Discard changes" icon="pi pi-undo" severity="secondary" [outlined]="true" (onClick)="confirmDiscard()" />
            </div>
        </p-drawer>

        <p-toast key="designer" position="bottom-right" />
        <p-confirm-dialog key="designer" styleClass="max-w-96" />
    `
})
export class AppDesignerComponent {
    readonly designerService = inject(AppDesignerService);

    readonly presetNames = Object.keys(PRESETS);

    readonly primaryColors = PRIMARY;

    readonly surfaces = SURFACES;

    readonly sliders = [
        { key: 'radius' as const, label: 'Border radius', min: 0, max: 20 },
        { key: 'fieldPaddingY' as const, label: 'Field padding', min: 4, max: 16 },
        { key: 'fieldFontSize' as const, label: 'Field font size', min: 12, max: 18 }
    ];

    readonly state = signal<DesignerState>({ ...DEFAULTS });

    private readonly configService = inject(AppConfigService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);
    private readonly platformId = inject(PLATFORM_ID);

    isDarkMode = computed(() => this.configService.appState().darkTheme);

    code = computed(() => {
        const state = this.state();

        return `import { definePreset } from '@openng/optimus-ui-themes'
import ${state.preset} from '@openng/optimus-ui-themes/${state.preset.toLowerCase()}'

export const MyPreset = definePreset(${state.preset}, {
  semantic: {
    primary: { 500: '${state.primary}' },
    borderRadius: { md: '${state.radius}px' },
    formField: {
      paddingY: '${state.fieldPaddingY}px',
      fontSize: '${state.fieldFontSize}px'
    }
  }
})`;
    });

    onVisibleChange(visible: boolean) {
        if (!visible) {
            this.designerService.close();
        }
    }

    set<K extends keyof DesignerState>(key: K, value: DesignerState[K]) {
        this.state.update((state) => ({ ...state, [key]: value }));
        this.apply();
    }

    toggleDarkMode() {
        this.configService.appState.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    async copy() {
        if (!isPlatformBrowser(this.platformId) || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(this.code());
        this.messageService.add({ key: 'designer', severity: 'success', summary: 'Copied', detail: 'The preset is on your clipboard', life: 2000 });
    }

    confirmDiscard() {
        this.confirmationService.confirm({
            key: 'designer',
            header: 'Discard changes?',
            message: 'The tokens go back to the preset this site ships with. Anything you have not copied is lost.',
            acceptLabel: 'Discard',
            rejectLabel: 'Keep editing',
            accept: () => this.discard()
        });
    }

    private discard() {
        this.state.set({ ...DEFAULTS });
        this.apply();
        this.messageService.add({ key: 'designer', severity: 'info', summary: 'Discarded', detail: 'Back to the shipped preset', life: 2000 });
    }

    /** One write per change: the tokens land on the document and every component follows. */
    private apply() {
        const state = this.state();
        const preset = PRESETS[state.preset];

        updatePreset({
            ...preset,
            semantic: {
                primary: palette(state.primary),
                borderRadius: { md: `${state.radius}px` },
                formField: {
                    paddingY: `${state.fieldPaddingY}px`,
                    fontSize: `${state.fieldFontSize}px`
                },
                /*
                 * The site ships with Noir, whose schemes point `primary.color` at the ends
                 * of the ramp — white on dark. Without this a colour picked here would come
                 * out as a near-white tint of itself.
                 */
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.500}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.600}',
                            activeColor: '{primary.700}'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.400}',
                            contrastColor: '{surface.950}',
                            hoverColor: '{primary.300}',
                            activeColor: '{primary.200}'
                        }
                    }
                }
            }
        });

        const surface = preset?.primitive?.[state.surface];

        if (surface) {
            updateSurfacePalette(surface);
        }
    }
}

/**
 * A whole primary ramp from one colour: a preset needs every step, so the lighter ones
 * are mixed towards white and the darker ones towards black. 500 is the colour itself.
 */
function palette(color: string): Record<number, string> {
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

    return steps.reduce<Record<number, string>>((ramp, step) => {
        if (step === 500) {
            ramp[step] = color;
        } else if (step < 500) {
            const towardsWhite = ((500 - step) / 450) * 90;

            ramp[step] = `color-mix(in srgb, ${color} ${100 - towardsWhite}%, #ffffff)`;
        } else {
            const towardsBlack = ((step - 500) / 450) * 70;

            ramp[step] = `color-mix(in srgb, ${color} ${100 - towardsBlack}%, #000000)`;
        }

        return ramp;
    }, {});
}
