import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    NgModule,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { QRLogo, BarcodeDisplayText, BarcodeExportFormat, BarcodeInvalidEvent, BarcodeMargin, BarcodeMode, BarcodePassThrough, BarcodeType, QrErrorCorrection } from '@openng/optimus-ui/types/barcode';
import { layoutLinear, layoutMatrix, layoutPath, layoutToSvg, paintLayout, type BarcodeLayout } from './barcode-layout';
import { BarcodeError, encodeLinear } from './barcode-linear';
import { encodeQr } from './barcode-qr';
import { encodeDataMatrix } from './barcode-datamatrix';
import { encodePdf417 } from './barcode-pdf417';
import { BarcodeStyle } from './style/barcodestyle';

/** What an encoder hands the base class. */
type Encoded = { kind: 'linear'; type: BarcodeType; modules: boolean[]; text: string } | { kind: 'matrix'; modules: boolean[][]; text: string; moduleSize?: number; quiet?: number; logo?: { src: string; width: number; height: number } };

/** A CSS length as pixels when it is one, else `fallback`. */
const px = (value: string | number | undefined, fallback: number) => {
    if (typeof value === 'number') return value;

    const m = /^\s*([\d.]+)\s*(px)?\s*$/.exec(value ?? '');

    return m ? Number(m[1]) : fallback;
};

const cssSize = (value: string | number) => (typeof value === 'number' ? `${value}px` : value);

/**
 * What a barcode and a QR Code share: the box, the colors, the text, the painters and the export.
 * @internal
 */
@Directive({ standalone: true })
export abstract class BarcodeBase extends BaseComponent<BarcodePassThrough> {
    /** @internal */
    _componentStyle = inject(BarcodeStyle);

    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * The value to encode.
     * @group Props
     */
    readonly value = input<string>('');
    /**
     * Width of the box, as a CSS length or a number of pixels.
     * @group Props
     */
    readonly width = input<string | number>('100%');
    /**
     * Height of the box, as a CSS length or a number of pixels.
     * @group Props
     */
    readonly height = input<string | number>('100px');
    /**
     * Draws the symbol as SVG or on a canvas.
     * @group Props
     */
    readonly mode = input<BarcodeMode>('svg');
    /**
     * The text printed with the symbol: `false` hides it, an object styles it.
     * @group Props
     */
    readonly displayText = input<BarcodeDisplayText | boolean | undefined>(undefined);
    /**
     * Color of the bars or modules. Black by default, which is what scanners read best.
     * @group Props
     */
    readonly foreColor = input<string>('#000000');
    /**
     * Color behind the symbol. White by default. Empty leaves it transparent.
     * @group Props
     */
    readonly backgroundColor = input<string>('#ffffff');
    /**
     * Space around the symbol, in pixels.
     * @group Props
     */
    readonly margin = input<BarcodeMargin | undefined>(undefined);
    /**
     * Accessible name. Defaults to a description of the symbol.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    /**
     * Fires when the value cannot be written in the chosen symbology.
     * @group Emits
     */
    readonly invalid = output<BarcodeInvalidEvent>();
    /**
     * Fires after a symbol was drawn.
     * @group Emits
     */
    readonly loaded = output<void>();

    /** Whether the text shows unless `displayText` says otherwise. @internal */
    protected abstract readonly textByDefault: boolean;
    /** Encodes the value, reading the inputs of the subclass. Throws a `BarcodeError`. @internal */
    protected abstract encode(): Encoded;
    /** The accessible name when none is given. @internal */
    protected abstract describe(): string;
    /** The picture to draw over the middle, for the symbols that take one. @internal */
    protected logoSource(): string | undefined {
        return undefined;
    }

    private readonly measured = signal<{ w: number; h: number } | null>(null);
    private readonly logoImage = signal<HTMLImageElement | null>(null);
    /** `true` when the logo had to be loaded without `crossOrigin`: it shows, but a canvas that holds it cannot be read back. */
    private logoTainted = false;
    private logoToken = 0;

    /** The box in pixels: what was measured, else what the inputs say. */
    private readonly box = computed(() => this.measured() ?? { w: px(this.width(), 300), h: px(this.height(), 100) });

    private readonly encoded = computed<{ data?: Encoded; error?: string }>(() => {
        if (!this.value()) return {};

        try {
            return { data: this.encode() };
        } catch (error) {
            // An encoder that fails in a way of its own (a value it did not foresee) is an invalid value too: the computed must not
            // throw, or every reader of `layout` throws with it and the symbol takes the view down.
            return { error: error instanceof BarcodeError ? error.message : error instanceof Error && error.message ? error.message : 'The value cannot be encoded' };
        }
    });

    /** The message of the encoder when the value cannot be written. @internal */
    readonly invalidMessage = computed(() => this.encoded().error ?? '');
    /** `true` when there is no value. @internal */
    readonly isEmpty = computed(() => !this.value());

    private readonly textOptions = computed<BarcodeDisplayText | null>(() => {
        const d = this.displayText();

        if (d === false) return null;
        if (d === true) return { visibility: true };
        if (d === undefined) return { visibility: this.textByDefault };

        return { ...d, visibility: d.visibility ?? this.textByDefault };
    });

    /** What is drawn, or `null` when there is nothing to draw. @internal */
    readonly layout = computed<BarcodeLayout | null>(() => {
        const data = this.encoded().data;

        if (!data) return null;

        const { w, h } = this.box();
        const common = { width: w, height: h, margin: this.margin(), displayText: this.textOptions(), defaultText: data.text };

        return data.kind === 'linear'
            ? layoutLinear({ ...common, kind: 'linear', type: data.type, modules: data.modules })
            : layoutMatrix({ ...common, kind: 'matrix', modules: data.modules, moduleSize: data.moduleSize, quiet: data.quiet, logo: data.logo });
    });

    /** @internal */
    readonly path = computed(() => layoutPath(this.layout()?.rects ?? []));
    /** @internal */
    readonly label = computed(() => this.ariaLabel() ?? this.describe());
    /** The color of the text. @internal */
    readonly textColor = computed(() => this.textOptions()?.color ?? this.foreColor());

    constructor() {
        super();

        afterNextRender(() => {
            const host = this.el.nativeElement as HTMLElement;
            const observer = new ResizeObserver(() => {
                const rect = host.getBoundingClientRect();

                if (rect.width && rect.height) this.measured.set({ w: Math.round(rect.width * 100) / 100, h: Math.round(rect.height * 100) / 100 });
            });

            observer.observe(host);
            this.destroyRef.onDestroy(() => observer.disconnect());
        });

        // What the consumer is told about.
        effect(() => {
            const { data, error } = this.encoded();

            untracked(() => {
                if (error) this.invalid.emit({ message: error });
                else if (data) this.loaded.emit();
            });
        });

        // The picture over the middle is loaded once, whichever way it is drawn.
        effect(() => {
            const src = this.logoSource();

            untracked(() => {
                // A logo that arrives after a newer one was asked for is not the one to show.
                const token = ++this.logoToken;

                this.logoTainted = false;

                if (!src || !this.browser) return this.logoImage.set(null);

                const load = (cors: boolean) => {
                    const image = new Image();

                    // Without `crossOrigin` the canvas is tainted and `toDataURL` throws, so it is asked for first.
                    if (cors) image.crossOrigin = 'anonymous';

                    image.onload = () => {
                        if (token !== this.logoToken) return;

                        this.logoTainted = !cors;
                        this.logoImage.set(image);
                    };
                    image.onerror = () => {
                        if (token !== this.logoToken) return;

                        // A server that does not allow it: the logo still shows, and the export leaves it out.
                        if (cors) load(false);
                        else this.logoImage.set(null);
                    };
                    image.src = src;
                };

                load(true);
            });
        });

        // The canvas painter. SVG needs none: the template draws it.
        effect(() => {
            const canvas = this.canvasRef()?.nativeElement;
            const layout = this.layout();
            const fore = this.foreColor();
            const back = this.backgroundColor();
            const text = this.textColor();
            const logo = this.logoImage();

            if (!canvas || !layout || !this.browser) return;

            const dpr = window.devicePixelRatio || 1;

            canvas.width = Math.round(layout.width * dpr);
            canvas.height = Math.round(layout.height * dpr);
            canvas.style.width = `${layout.width}px`;
            canvas.style.height = `${layout.height}px`;

            const ctx = canvas.getContext('2d')!;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            paintLayout(ctx, layout, fore, back, text, logo);
        });
    }

    /** @internal */
    protected hostWidth(): string {
        return cssSize(this.width());
    }

    /** @internal */
    protected hostHeight(): string {
        return cssSize(this.height());
    }

    // ---------------------------------------------------------------------------------------------
    // Export
    // ---------------------------------------------------------------------------------------------

    /** The symbol as an SVG document, or an empty string when there is none. */
    toSvg(): string {
        const layout = this.layout();

        return layout ? layoutToSvg(layout, this.foreColor(), this.backgroundColor(), this.textColor()) : '';
    }

    /** The symbol as a data URL. Mirrors Syncfusion's `exportAsBase64Image`. */
    exportAsBase64(format: BarcodeExportFormat = 'png', scale = 2): string {
        const layout = this.layout();

        if (!layout) return '';
        // The canvas of the export does not exist on the server.
        if (format !== 'svg' && !this.browser) return '';
        if (format === 'svg') return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(this.toSvg())}`;

        const canvas = document.createElement('canvas');

        canvas.width = Math.round(layout.width * scale);
        canvas.height = Math.round(layout.height * scale);

        const ctx = canvas.getContext('2d')!;

        ctx.scale(scale, scale);
        // A JPEG has no alpha: without a fill it would come out black.
        paintLayout(ctx, layout, this.foreColor(), this.backgroundColor() || (format === 'jpeg' ? '#ffffff' : ''), this.textColor(), this.logoTainted ? null : this.logoImage());

        try {
            return canvas.toDataURL(`image/${format}`);
        } catch {
            return '';
        }
    }

    /** Downloads the symbol. Mirrors Syncfusion's `exportImage`. Returns the data URL. */
    exportImage(fileName = 'barcode', format: BarcodeExportFormat = 'png'): string {
        if (!this.browser) return '';

        const dataUrl = this.exportAsBase64(format);

        if (!dataUrl) return '';

        const link = document.createElement('a');

        link.href = dataUrl;
        link.download = `${fileName}.${format === 'jpeg' ? 'jpg' : format}`;
        link.click();

        return dataUrl;
    }
}

const TEMPLATE = `
    @if (layout(); as l) {
        @if (mode() === 'svg') {
            <svg [class]="cx('svg')" role="img" [attr.aria-label]="label()" [attr.width]="l.width" [attr.height]="l.height" [attr.viewBox]="'0 0 ' + l.width + ' ' + l.height" [pBind]="ptm('svg')">
                @if (backgroundColor()) {
                    <rect width="100%" height="100%" [attr.fill]="backgroundColor()" />
                }
                <path [attr.d]="path()" [attr.fill]="foreColor()" shape-rendering="crispEdges" />
                @if (l.logo; as g) {
                    <rect [attr.x]="g.pad.x" [attr.y]="g.pad.y" [attr.width]="g.pad.w" [attr.height]="g.pad.h" [attr.fill]="backgroundColor() || '#ffffff'" />
                    <image [attr.href]="g.src" [attr.x]="g.x" [attr.y]="g.y" [attr.width]="g.w" [attr.height]="g.h" preserveAspectRatio="xMidYMid meet" />
                }
                @for (t of l.texts; track $index) {
                    <text [attr.x]="t.x" [attr.y]="t.y" [attr.text-anchor]="t.anchor" [attr.font-size]="t.size" [attr.font-family]="l.font" [attr.fill]="textColor()">{{ t.text }}</text>
                }
            </svg>
        } @else {
            <canvas #canvas [class]="cx('canvas')" role="img" [attr.aria-label]="label()" [pBind]="ptm('canvas')"></canvas>
        }
    }
`;

/**
 * Barcode draws a value as a one-dimensional barcode: Code 128, Code 39, EAN-13, EAN-8 or UPC-A.
 *
 * The API follows Syncfusion's BarcodeGenerator: `type`, `value`, `width`, `height`, `mode`,
 * `displayText`, `foreColor`, `backgroundColor`, `margin`, `enableCheckSum`, the `invalid` and `loaded` events
 * and the `exportImage` and `exportAsBase64` methods. Besides those it writes Code 11, Codabar and Code 39 Extended.
 *
 * @group Components
 */
@Component({
    selector: 'p-barcode',
    standalone: true,
    imports: [SharedModule, Bind],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BarcodeStyle, { provide: PARENT_INSTANCE, useExisting: Barcode }],
    host: { '[class]': 'cx("root")', 'data-scope': 'barcode', 'data-part': 'root', '[style.width]': 'hostWidth()', '[style.height]': 'hostHeight()', '[attr.aria-invalid]': 'invalidMessage() ? "true" : null' },
    hostDirectives: [Bind]
})
export class Barcode extends BarcodeBase {
    componentName = 'Barcode';

    /**
     * The symbology.
     * @group Props
     */
    readonly type = input<BarcodeType>('code128');
    /**
     * Adds a check character to Code 39, and checks the last digit of an EAN or UPC value that carries one.
     * Code 128, EAN and UPC always compute theirs.
     * @group Props
     */
    readonly enableCheckSum = input(true, { transform: booleanAttribute });

    protected readonly textByDefault = true;

    protected encode(): Encoded {
        const symbol = encodeLinear(this.type(), this.value(), this.enableCheckSum());

        return { kind: 'linear', type: this.type(), modules: symbol.modules, text: symbol.text };
    }

    protected describe(): string {
        return `${this.type()} barcode: ${this.value()}`;
    }
}

/**
 * QRCode draws a value as a QR Code.
 *
 * The API follows Syncfusion's QRCodeGenerator: `value`, `width`, `height`, `mode`, `displayText`, `foreColor`, `backgroundColor`,
 * `margin`, `errorCorrectionLevel`, `version`, `xDimension`, the `invalid` and `loaded` events and the
 * `exportImage` and `exportAsBase64` methods, and takes a `logo` for the middle.
 *
 * @group Components
 */
@Component({
    selector: 'p-qrcode, p-qrCode, p-qr-code',
    standalone: true,
    imports: [SharedModule, Bind],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BarcodeStyle, { provide: PARENT_INSTANCE, useExisting: QRCode }],
    host: { '[class]': 'cx("root") + " p-qrcode"', 'data-scope': 'barcode', 'data-part': 'root', '[style.width]': 'hostWidth()', '[style.height]': 'hostHeight()', '[attr.aria-invalid]': 'invalidMessage() ? "true" : null' },
    hostDirectives: [Bind]
})
export class QRCode extends BarcodeBase {
    componentName = 'QRCode';

    /**
     * How much of the symbol is spent on error correction. The level is raised on its own when the value leaves room.
     * @group Props
     */
    readonly errorCorrectionLevel = input<QrErrorCorrection>('medium');
    /**
     * A version from 1 to 40. Omitted, the smallest that fits.
     * @group Props
     */
    readonly version = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });
    /**
     * Side of one module in pixels. Omitted, the symbol fills the box.
     * @group Props
     */
    readonly xDimension = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });

    /**
     * A picture for the middle of the symbol: its `imageSource`, and its `width` and `height` in pixels. The level of error correction goes to
     * `high`, and the picture is made smaller until it covers no more than a quarter of the symbol.
     * @group Props
     */
    readonly logo = input<QRLogo | undefined>(undefined);

    constructor() {
        super();
    }

    protected readonly textByDefault = false;

    protected override logoSource(): string | undefined {
        return this.logo()?.imageSource;
    }

    protected encode(): Encoded {
        const logo = this.logo();
        const symbol = encodeQr(this.value(), { errorCorrection: logo ? 'high' : this.errorCorrectionLevel(), version: this.version(), boost: !logo });

        return { kind: 'matrix', modules: symbol.modules, text: this.value(), moduleSize: this.xDimension(), logo: logo?.imageSource ? { src: logo.imageSource, width: logo.width ?? 64, height: logo.height ?? 64 } : undefined };
    }

    protected describe(): string {
        return `QR code: ${this.value()}`;
    }
}

/**
 * DataMatrix draws a value as a Data Matrix (ECC 200), the small square symbol of parts and labels.
 *
 * The API follows Syncfusion's DataMatrixGenerator: `value`, `width`, `height`, `mode`, `displayText`, `foreColor`, `backgroundColor`,
 * `margin`, the `invalid` and `loaded` events and the `exportImage` and `exportAsBase64` methods. Square sizes from 10 by 10 to
 * 144 by 144 are written, in the ASCII encoding.
 *
 * @group Components
 */
@Component({
    selector: 'p-datamatrix, p-dataMatrix, p-data-matrix',
    standalone: true,
    imports: [SharedModule, Bind],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BarcodeStyle, { provide: PARENT_INSTANCE, useExisting: DataMatrix }],
    host: { '[class]': 'cx("root") + " p-datamatrix"', 'data-scope': 'barcode', 'data-part': 'root', '[style.width]': 'hostWidth()', '[style.height]': 'hostHeight()', '[attr.aria-invalid]': 'invalidMessage() ? "true" : null' },
    hostDirectives: [Bind]
})
export class DataMatrix extends BarcodeBase {
    componentName = 'DataMatrix';

    /**
     * Side of one module in pixels. Omitted, the symbol fills the box.
     * @group Props
     */
    readonly xDimension = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });

    protected readonly textByDefault = false;

    protected encode(): Encoded {
        const symbol = encodeDataMatrix(this.value());

        return { kind: 'matrix', modules: symbol.modules, text: this.value(), moduleSize: this.xDimension(), quiet: 4 };
    }

    protected describe(): string {
        return `Data Matrix: ${this.value()}`;
    }
}

/**
 * Pdf417 draws a value as a PDF417, the stacked linear symbol of tickets and identity documents.
 *
 * Text is written in byte compaction, declared UTF-8 beyond ASCII, and digits in numeric compaction. The error correction level
 * follows the amount of data unless `errorCorrectionLevel` is given.
 *
 * @group Components
 */
@Component({
    selector: 'p-pdf417',
    standalone: true,
    imports: [SharedModule, Bind],
    template: TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BarcodeStyle, { provide: PARENT_INSTANCE, useExisting: Pdf417 }],
    host: { '[class]': 'cx("root") + " p-pdf417"', 'data-scope': 'barcode', 'data-part': 'root', '[style.width]': 'hostWidth()', '[style.height]': 'hostHeight()', '[attr.aria-invalid]': 'invalidMessage() ? "true" : null' },
    hostDirectives: [Bind]
})
export class Pdf417 extends BarcodeBase {
    componentName = 'Pdf417';

    /**
     * Columns of data, 1 to 30. Omitted, the symbol comes out about three times as wide as tall.
     * @group Props
     */
    readonly columns = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });
    /**
     * Error correction level, 0 to 8. Omitted, it follows the amount of data.
     * @group Props
     */
    readonly errorCorrectionLevel = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });

    protected readonly textByDefault = false;

    protected encode(): Encoded {
        const symbol = encodePdf417(this.value(), { columns: this.columns(), errorCorrectionLevel: this.errorCorrectionLevel() });

        return { kind: 'matrix', modules: symbol.modules, text: this.value(), quiet: 3 };
    }

    protected describe(): string {
        return `PDF417: ${this.value()}`;
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Barcode, QRCode, DataMatrix, Pdf417, SharedModule],
    exports: [Barcode, QRCode, DataMatrix, Pdf417, SharedModule]
})
export class BarcodeModule {}
