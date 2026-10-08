import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    model,
    NgModule,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Bind } from '@openng/optimus-ui/bind';
import type { CropperChangeEvent, CropperExportOptions, CropperOutputType, CropperPassThrough, CropperSelectionRect } from '@openng/optimus-ui/types/cropper';
import { CropperStyle } from './style/cropperstyle';

export const CROPPER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Cropper),
    multi: true
};

/** The parts of Cropper.js that are used, so the library stays a lazy, optional import. */
interface CropperJs {
    getCropperCanvas(): any;
    getCropperImage(): any;
    getCropperSelection(): any;
    destroy(): void;
}

const handles = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];

/**
 * Cropper crops, rotates, flips and zooms an image, on top of Cropper.js.
 *
 * Give it a `src`, move and resize the crop box, and the cropped picture is the `value`, as a data URL: it binds to a signal
 * form with `[formField]`, to a classic form, or two-way with `[(value)]`. `rotate`, `flipHorizontal`, `flipVertical`, `zoom`,
 * `reset`, `selectAll`, `clear`, `toDataURL`, `toBlob` and `getCroppedCanvas` drive it from code.
 *
 * Cropper.js is an optional peer dependency, loaded the first time a cropper is shown.
 *
 * @group Components
 */
@Component({
    selector: 'p-cropper',
    standalone: true,
    imports: [SharedModule],
    template: `<div #stage [class]="cx('stage')" role="img" [attr.aria-label]="alt() || 'Image to crop'"></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [CropperStyle, CROPPER_VALUE_ACCESSOR, { provide: PARENT_INSTANCE, useExisting: Cropper }],
    host: { '[class]': 'cx("root")', 'data-scope': 'cropper', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class Cropper extends BaseEditableHolder<CropperPassThrough> {
    componentName = 'Cropper';

    /** @internal */
    _componentStyle = inject(CropperStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly stageRef = viewChild.required<ElementRef<HTMLElement>>('stage');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The cropped picture as a data URL, or `null` when there is no crop box. Supports `[(value)]`, `[formField]`, `formControl` and `ngModel`.
     * @group Props
     */
    readonly value = model<string | null>(null);
    /**
     * The image to crop, as a URL or data URL.
     * @group Props
     */
    readonly src = input<string>('');
    /**
     * Text that describes the image.
     * @group Props
     */
    readonly alt = input<string>('');
    /**
     * `crossorigin` of the image. Set it to `anonymous` for an image from another origin, or the crop cannot be read back.
     * @group Props
     */
    readonly crossOrigin = input<'anonymous' | 'use-credentials' | undefined>(undefined);
    /**
     * Shape of the crop box, as width over height (`16 / 9`, `1`). Empty or 0 leaves it free.
     * @group Props
     */
    readonly aspectRatio = input<number | undefined, unknown>(undefined, { transform: (value: unknown) => (value == null || value === '' || Number(value) <= 0 || Number.isNaN(Number(value)) ? undefined : Number(value)) });
    /**
     * How much of the image the crop box covers when it first appears, from 0 to 1.
     * @group Props
     */
    readonly initialCoverage = input(0.5, { transform: numberAttribute });
    /**
     * Whether the crop box can be moved.
     * @group Props
     */
    readonly movable = input(true, { transform: booleanAttribute });
    /**
     * Whether the crop box can be resized.
     * @group Props
     */
    readonly resizable = input(true, { transform: booleanAttribute });
    /**
     * Whether the image can be zoomed with the wheel or a pinch.
     * @group Props
     */
    readonly zoomable = input(true, { transform: booleanAttribute });
    /**
     * Whether the image can be moved under the crop box.
     * @group Props
     */
    readonly translatable = input(true, { transform: booleanAttribute });
    /**
     * Whether the arrow keys move the crop box.
     * @group Props
     */
    readonly keyboard = input(true, { transform: booleanAttribute });
    /**
     * Draws the guide lines inside the crop box.
     * @group Props
     */
    readonly grid = input(true, { transform: booleanAttribute });
    /**
     * Draws a cross in the middle of the crop box.
     * @group Props
     */
    readonly crosshair = input(true, { transform: booleanAttribute });
    /**
     * Dims what is outside the crop box.
     * @group Props
     */
    readonly shade = input(true, { transform: booleanAttribute });
    /**
     * Draws a checkerboard behind the image.
     * @group Props
     */
    readonly background = input(true, { transform: booleanAttribute });
    /**
     * Width of the cropped picture, in pixels. Empty keeps the size of the crop in the image.
     * @group Props
     */
    readonly outputWidth = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Height of the cropped picture, in pixels.
     * @group Props
     */
    readonly outputHeight = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
    /**
     * Format of the cropped picture.
     * @group Props
     */
    readonly outputType = input<CropperOutputType>('image/png');
    /**
     * Quality of a lossy format, from 0 to 1.
     * @group Props
     */
    readonly quality = input(0.92, { transform: numberAttribute });
    /**
     * Lets the `value` follow every change of the crop box. Turn it off to read the crop only with `toDataURL`.
     * @group Props
     */
    readonly autoValue = input(true, { transform: booleanAttribute });
    /**
     * Stops the crop box from being changed by the user.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Emitted when the image is shown and the crop box is ready.
     * @group Emits
     */
    readonly ready = output<void>();
    /**
     * Emitted when the image could not be loaded.
     * @group Emits
     */
    readonly failed = output<void>();
    /**
     * Emitted when the crop changes, by the user or from code.
     * @group Emits
     */
    readonly changed = output<CropperChangeEvent>();
    /**
     * Emitted when the control loses focus, for signal forms.
     * @group Emits
     */
    readonly touch = output<void>();

    /** `true` once an image is shown. @internal */
    readonly loaded = signal(false);
    /** The crop box, in CSS pixels of the cropper, or `null` when there is none. */
    readonly selection = signal<CropperSelectionRect | null>(null);

    private instance: CropperJs | null = null;
    private token = 0;
    private lastEmitted: string | null = null;
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        super();

        afterNextRender(() => {
            // A new image builds the cropper again; the options apply to the one that is there.
            effect(
                () => {
                    const src = this.src();

                    untracked(() => void this.mount(src));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    this.readSettings();
                    untracked(() => this.applySettings());
                },
                { injector: this.injector }
            );
        });

        this.destroyRef.onDestroy(() => {
            clearTimeout(this.timer);
            this.teardown();
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Cropper.js
    // ---------------------------------------------------------------------------------------------

    private readSettings(): void {
        this.aspectRatio();
        this.movable();
        this.resizable();
        this.zoomable();
        this.translatable();
        this.keyboard();
        this.grid();
        this.crosshair();
        this.shade();
        this.background();
        this.readonly();
        this.$disabled();
        this.loaded();
    }

    private template(): string {
        const keyboard = this.keyboard() ? ' keyboard' : '';
        // The colour of the crop box comes from the `cropper.selection.color` token, which the theme writes as a variable.
        const color = this.browser ? getComputedStyle(this.el.nativeElement).getPropertyValue('--p-cropper-selection-color').trim() : '';

        return (
            `<cropper-canvas${color ? ` theme-color="${color}"` : ''}${this.background() ? ' background' : ''}${this.readonly() || this.$disabled() ? ' disabled' : ''}>` +
            `<cropper-image rotatable scalable skewable translatable></cropper-image>` +
            `<cropper-shade${this.shade() ? '' : ' hidden'}></cropper-shade>` +
            `<cropper-handle action="select" plain></cropper-handle>` +
            `<cropper-selection initial-coverage="${this.initialCoverage()}"${this.aspectRatio() ? ` aspect-ratio="${this.aspectRatio()}"` : ''} movable resizable zoomable${keyboard}>` +
            `<cropper-grid role="grid" bordered covered></cropper-grid>` +
            `<cropper-crosshair centered></cropper-crosshair>` +
            `<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>` +
            handles.map((h) => `<cropper-handle action="${h}-resize"></cropper-handle>`).join('') +
            `</cropper-selection></cropper-canvas>`
        );
    }

    private async mount(src: string): Promise<void> {
        const token = ++this.token;

        this.teardown();
        this.loaded.set(false);
        this.selection.set(null);

        if (!this.browser || !src) return this.publish(null);

        let Lib: (typeof import('cropperjs'))['default'];
        let image: HTMLImageElement;

        try {
            [{ default: Lib }, image] = await Promise.all([import('cropperjs'), this.loadImage(src)]);
        } catch {
            if (token === this.token) this.failed.emit();

            return;
        }

        if (token !== this.token) return;

        const stage = this.stageRef().nativeElement;

        stage.replaceChildren();

        const instance = new Lib(image, { container: stage, template: this.template() }) as unknown as CropperJs;

        this.instance = instance;

        const canvas = instance.getCropperCanvas();
        const selection = instance.getCropperSelection();

        // The elements upgrade on the next frame; the crop box is read after that.
        await canvas?.$ready?.catch?.(() => null);
        await instance
            .getCropperImage()
            ?.$ready?.()
            .catch(() => null);

        if (token !== this.token) return;

        this.loaded.set(true);
        this.applySettings();
        selection?.addEventListener('change', (event: Event) => this.onSelectionChange(event as CustomEvent<CropperSelectionRect>));
        canvas?.addEventListener('actionend', () => this.onActionEnd());
        canvas?.addEventListener('focusout', () => {
            this.onModelTouched();
            this.touch.emit();
        });
        this.afterTransform();
        this.ready.emit();
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const cross = this.crossOrigin();

            if (cross) image.crossOrigin = cross;

            image.alt = this.alt();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('The image could not be loaded'));
            image.src = src;
        });
    }

    private teardown(): void {
        this.instance?.destroy();
        this.instance = null;

        if (this.browser) this.stageRef().nativeElement.replaceChildren();
    }

    /** Settings that can change while an image is shown. */
    private applySettings(): void {
        const instance = this.instance;

        if (!instance || !this.loaded()) return;

        const canvas = instance.getCropperCanvas();
        const image = instance.getCropperImage();
        const selection = instance.getCropperSelection();
        const locked = this.readonly() || this.$disabled();

        if (canvas) {
            canvas.disabled = locked;
            canvas.background = this.background();
        }

        if (image) image.translatable = this.translatable();

        if (selection) {
            selection.movable = this.movable() && !locked;
            selection.resizable = this.resizable() && !locked;
            selection.zoomable = this.zoomable();
            selection.keyboard = this.keyboard() && !locked;

            const ratio = this.aspectRatio() ?? NaN;

            if (!Object.is(selection.aspectRatio, ratio) && !(Number.isNaN(selection.aspectRatio) && Number.isNaN(ratio))) {
                selection.aspectRatio = ratio;
                selection.$reset?.();
            }

            selection.querySelectorAll('cropper-grid').forEach((el: HTMLElement) => (el.hidden = !this.grid()));
            selection.querySelectorAll('cropper-crosshair').forEach((el: HTMLElement) => (el.hidden = !this.crosshair()));
            selection.querySelectorAll('cropper-handle:not([action="move"])').forEach((el: HTMLElement) => (el.hidden = !this.resizable()));
        }

        const shade = canvas?.querySelector('cropper-shade') as HTMLElement | null;

        if (shade) shade.hidden = !this.shade();
    }

    // ---------------------------------------------------------------------------------------------
    // Value
    // ---------------------------------------------------------------------------------------------

    private onSelectionChange(event: CustomEvent<CropperSelectionRect>): void {
        const { x, y, width, height } = event.detail;

        this.selection.set(width > 0 && height > 0 ? { x, y, width, height } : null);
    }

    private onActionEnd(): void {
        this.afterTransform();
        this.notify('crop');
    }

    /** The selection element is the truth about the crop box once a gesture or a call has finished. */
    private afterTransform(): void {
        const selection = this.instance?.getCropperSelection();

        if (!selection) return;

        this.selection.set(selection.width > 0 && selection.height > 0 ? { x: selection.x, y: selection.y, width: selection.width, height: selection.height } : null);
    }

    private notify(type: CropperChangeEvent['type']): void {
        clearTimeout(this.timer);

        // The crop is drawn after the elements have settled.
        this.timer = setTimeout(async () => {
            this.afterTransform();

            const value = this.autoValue() ? await this.toDataURL().catch(() => null) : this.value();

            if (this.autoValue()) this.publish(value);

            this.changed.emit({ type, selection: this.selection(), value });
        }, 0);
    }

    private publish(value: string | null): void {
        this.lastEmitted = value;
        this.value.set(value);
        this.onModelChange(value);
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** Turns the image by an angle: a number of degrees, or a string such as `'90deg'`. */
    rotate(angle: number | string = 90): void {
        this.instance?.getCropperImage()?.$rotate(typeof angle === 'number' ? `${angle}deg` : angle);
        this.notify('rotate');
    }

    /** Mirrors the image from left to right. */
    flipHorizontal(): void {
        this.instance?.getCropperImage()?.$scale(-1, 1);
        this.notify('flip');
    }

    /** Mirrors the image from top to bottom. */
    flipVertical(): void {
        this.instance?.getCropperImage()?.$scale(1, -1);
        this.notify('flip');
    }

    /** Zooms the image by a ratio: 0.1 makes it a tenth larger, -0.1 a tenth smaller. */
    zoom(ratio: number): void {
        this.instance?.getCropperImage()?.$zoom(ratio);
        this.notify('zoom');
    }

    /** Puts the image and the crop box back as they were when the image was loaded. */
    reset(): void {
        const instance = this.instance;

        instance?.getCropperImage()?.$resetTransform?.();
        instance?.getCropperImage()?.$center?.('contain');
        instance?.getCropperSelection()?.$reset?.();
        this.notify('reset');
    }

    /** Makes the crop box cover the whole image. */
    selectAll(): void {
        const instance = this.instance;
        const image = instance?.getCropperImage();
        const canvas = instance?.getCropperCanvas();

        if (!image || !canvas) return;

        const a = image.getBoundingClientRect();
        const b = canvas.getBoundingClientRect();

        instance?.getCropperSelection()?.$change(a.left - b.left, a.top - b.top, a.width, a.height);
        this.notify('select-all');
    }

    /** Removes the crop box. */
    clear(): void {
        this.instance?.getCropperSelection()?.$clear?.();
        this.notify('clear');
    }

    /** Draws the crop on a canvas. Resolves `null` when there is no image or no crop box. */
    async getCroppedCanvas(options: CropperExportOptions = {}): Promise<HTMLCanvasElement | null> {
        const selection = this.instance?.getCropperSelection();

        if (!selection || !(selection.width > 0 && selection.height > 0)) return null;

        const width = options.width ?? this.outputWidth();
        const height = options.height ?? this.outputHeight();
        const type = options.type ?? this.outputType();
        const fill = options.fillColor ?? (type === 'image/jpeg' ? '#ffffff' : '');
        const canvas: HTMLCanvasElement = await selection.$toCanvas({
            width,
            height,
            beforeDraw: fill
                ? (context: CanvasRenderingContext2D, target: HTMLCanvasElement) => {
                      context.fillStyle = fill;
                      context.fillRect(0, 0, target.width, target.height);
                  }
                : undefined
        });

        return canvas;
    }

    /** The crop as a data URL. Resolves `null` when there is no crop. */
    async toDataURL(options: CropperExportOptions = {}): Promise<string | null> {
        const canvas = await this.getCroppedCanvas(options);

        return canvas ? canvas.toDataURL(options.type ?? this.outputType(), options.quality ?? this.quality()) : null;
    }

    /** The crop as a `Blob`. Resolves `null` when there is no crop. */
    async toBlob(options: CropperExportOptions = {}): Promise<Blob | null> {
        const canvas = await this.getCroppedCanvas(options);

        return canvas ? new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, options.type ?? this.outputType(), options.quality ?? this.quality())) : null;
    }

    /** What a classic form writes in. The crop is made from the image, so a value from outside is only kept, or cleared with `null`. */
    override writeControlValue(value: string | null): void {
        this.value.set(typeof value === 'string' && value ? value : null);
        this.cd.markForCheck();
    }

    /** Moves the focus onto the crop box. A signal form calls it to focus the field. */
    focus(options?: FocusOptions): void {
        (this.instance?.getCropperSelection() as HTMLElement | null)?.focus(options);
    }
}

/** Accepts a numeric input while letting `undefined` stay `undefined`. */
function optionalNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;

    const parsed = numberAttribute(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Cropper, SharedModule],
    exports: [Cropper, SharedModule]
})
export class CropperModule {}
