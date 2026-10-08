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
    NgZone,
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
import type { SignatureBeforeSaveEvent, SignatureChangeEvent, SignatureFileType, SignaturePassThrough, SignatureSavedEvent, SignatureStroke } from '@openng/optimus-ui/types/signature';
import { drawStroke, escapeAttr, scaleStrokes, svgToDataUrl, toSvg } from './signature-engine';
import { SignatureStyle } from './style/signaturestyle';

export const SIGNATURE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Signature),
    multi: true
};

/** An image under the strokes: a loaded signature, or a typed one. */
interface Layer {
    source: CanvasImageSource;
    url: string;
}

const loadImage = (url: string, signal?: AbortSignal): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        const stop = () => {
            image.onload = image.onerror = null;
            image.src = '';
            reject(new DOMException('The image load was cancelled', 'AbortError'));
        };

        if (signal?.aborted) return stop();

        signal?.addEventListener('abort', stop, { once: true });
        image.onload = () => {
            signal?.removeEventListener('abort', stop);
            resolve(image);
        };
        image.onerror = () => {
            signal?.removeEventListener('abort', stop);
            reject(new Error('The image could not be loaded'));
        };
        image.src = url;
    });

/**
 * Signature captures a handwritten signature from a mouse, a pen or a finger.
 *
 * The API follows Syncfusion's Signature: `backgroundColor`, `backgroundImage`, `strokeColor`,
 * `minStrokeWidth`, `maxStrokeWidth`, `velocity`, `saveWithBackground`, and the `clear`, `undo`, `redo`,
 * `canUndo`, `canRedo`, `isEmpty`, `save`, `saveAsBlob`, `getSignature`, `loadSignature` and `draw` methods.
 * The value is the signature as a PNG data URL, so it binds to a signal form with `[formField]`, to a
 * classic form, or two-way with `[(value)]`.
 *
 * @group Components
 */
@Component({
    selector: 'p-signature',
    standalone: true,
    imports: [SharedModule],
    template: `
        <canvas
            #canvas
            [class]="cx('canvas')"
            role="img"
            [attr.tabindex]="$disabled() ? -1 : 0"
            [attr.aria-label]="ariaLabel() || padLabel()"
            [attr.aria-description]="isEmpty() ? emptyLabel() : signedLabel()"
            [attr.aria-readonly]="locked() ? 'true' : null"
            (pointerdown)="onPointerDown($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerUp($event)"
            (keydown)="onKeydown($event)"
            (blur)="flushValue(); onModelTouched(); touch.emit()"
        ></canvas>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SignatureStyle, SIGNATURE_VALUE_ACCESSOR, { provide: PARENT_INSTANCE, useExisting: Signature }],
    host: { '[class]': 'cx("root")', 'data-scope': 'signature', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class Signature extends BaseEditableHolder<SignaturePassThrough> {
    componentName = 'Signature';

    /** @internal */
    _componentStyle = inject(SignatureStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The signature as a PNG data URL, or `null` when empty. Supports `[(value)]`, `[formField]`, `formControl` and `ngModel`.
     * @group Props
     */
    readonly value = model<string | null>(null);
    /**
     * Fill behind the strokes. Empty leaves the pad transparent.
     * @group Props
     */
    readonly backgroundColor = input<string>('');
    /**
     * Image behind the strokes, as a URL or data URL.
     * @group Props
     */
    readonly backgroundImage = input<string>('');
    /**
     * Color of the pen. Empty takes the `color` of the pad, which the `signature.color` token sets.
     * @group Props
     */
    readonly strokeColor = input<string>('');
    /**
     * Thinnest the line gets, in pixels.
     * @group Props
     */
    readonly minStrokeWidth = input(0.5, { transform: numberAttribute });
    /**
     * Thickest the line gets, in pixels.
     * @group Props
     */
    readonly maxStrokeWidth = input(2.5, { transform: numberAttribute });
    /**
     * How much the speed of the pen thins the line, from 0 (none) to 1 (fully).
     * @group Props
     */
    readonly velocity = input(0.7, { transform: numberAttribute });
    /**
     * Includes the background color and image when the signature is exported.
     * @group Props
     */
    readonly saveWithBackground = input(true, { transform: booleanAttribute });
    /**
     * Shows the signature and takes the pen away.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Syncfusion's spelling of `readonly`.
     * @group Props
     */
    readonly isReadOnly = input(false, { transform: booleanAttribute });
    /**
     * Accessible name of the pad.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    /**
     * Accessible name of the pad when `aria-label` is not set.
     * @group Props
     */
    readonly padLabel = input('Signature pad');
    /**
     * Accessible description of a pad that holds nothing.
     * @group Props
     */
    readonly emptyLabel = input('Empty');
    /**
     * Accessible description of a pad that holds a signature.
     * @group Props
     */
    readonly signedLabel = input('Signed');
    /**
     * Milliseconds to wait after the last stroke before the PNG is written to `value`. Encoding the whole pad after each stroke is
     * costly on a large pad; with a delay the strokes are joined into one encoding, which also runs when the pad loses focus.
     * `0` encodes right away.
     * @group Props
     */
    readonly valueDebounce = input(0, { transform: numberAttribute });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Fires when the content changes, by pen or by method.
     * @group Emits
     */
    readonly changed = output<SignatureChangeEvent>();
    /**
     * Fires before `save` exports. Change `fileName` or `type`, or set `cancel`.
     * @group Emits
     */
    readonly beforeSave = output<SignatureBeforeSaveEvent>();
    /**
     * Fires after `save` exported.
     * @group Emits
     */
    readonly saved = output<SignatureSavedEvent>();
    /**
     * Fires once, when the pad is ready.
     * @group Emits
     */
    readonly created = output<void>();
    /**
     * Fires when the pad loses focus. A signal form reads it as `touched`.
     * @group Emits
     */
    readonly touch = output<void>();

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    private readonly strokes = signal<SignatureStroke[]>([]);
    private readonly undone = signal<SignatureStroke[]>([]);
    private readonly layer = signal<Layer | null>(null);
    private readonly bgImage = signal<HTMLImageElement | null>(null);
    private current: SignatureStroke | null = null;
    private pointerId = -1;
    private startTime = 0;
    private width = 0;
    private height = 0;
    private frame = 0;
    private lastEmitted: string | null = null;
    private dpr = 1;
    private cache: HTMLCanvasElement | null = null;
    private cacheDirty = true;
    private commitTimer: ReturnType<typeof setTimeout> | undefined;
    private pendingCommit: SignatureChangeEvent['type'] | null = null;
    private loadToken = 0;
    private cleared: { strokes: SignatureStroke[]; undone: SignatureStroke[]; layer: Layer | null } | null = null;
    private readonly zone = inject(NgZone);

    /** `true` while a stroke is being drawn. @internal */
    readonly drawing = signal(false);
    /** `true` when nothing can be drawn. @internal */
    readonly locked = computed(() => this.readonly() || this.isReadOnly() || this.$disabled());
    /** `true` when the pad holds nothing. */
    readonly isEmpty = computed(() => !this.strokes().length && !this.layer());

    constructor() {
        super();

        afterNextRender(() => {
            this.observe();
            this.listen();
            this.created.emit();
        });

        // A new image, color or pen setting repaints the pad.
        effect(() => {
            this.backgroundColor();
            this.strokes();
            this.layer();
            this.bgImage();
            untracked(() => {
                this.cacheDirty = true;
                this.schedule();
            });
        });

        effect((onCleanup) => {
            const url = this.backgroundImage();

            if (!this.browser) return;
            if (!url) return untracked(() => this.bgImage.set(null));

            // A newer image (or the end of the component) cancels the one that is still loading.
            const abort = new AbortController();

            onCleanup(() => abort.abort());

            loadImage(url, abort.signal)
                .then((image) => this.bgImage.set(image))
                .catch((error) => {
                    if (!abort.signal.aborted && error?.name !== 'AbortError') this.bgImage.set(null);
                });
        });

        // A value that arrives from outside (a form, a binding) replaces what is on the pad.
        effect(() => {
            const next = this.value() ?? null;

            untracked(() => {
                if (next === this.lastEmitted) return;

                this.lastEmitted = next;

                if (next) void this.showValue(next);
                else this.wipe();
            });
        });

        this.destroyRef.onDestroy(() => {
            this.loadToken++;

            // Nothing is written from here: the outputs are already gone by now, so a write would
            // only raise NG0953. The pending timer is simply dropped.
            this.pendingCommit = null;
            clearTimeout(this.commitTimer);

            if (this.browser) cancelAnimationFrame(this.frame);
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Canvas
    // ---------------------------------------------------------------------------------------------

    private observe(): void {
        const host = this.el.nativeElement as HTMLElement;
        const observer = new ResizeObserver(() => this.resize());

        observer.observe(host);
        this.destroyRef.onDestroy(() => observer.disconnect());
        this.watchDpr();
        this.resize();
    }

    /** The pixel ratio changes when the page is zoomed or moved to another screen: the canvas has to follow. */
    private watchDpr(): void {
        if (typeof matchMedia !== 'function') return;

        const query = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
        const changed = () => {
            query.removeEventListener('change', changed);
            this.resize();
            this.watchDpr();
        };

        query.addEventListener('change', changed, { once: true });
        this.destroyRef.onDestroy(() => query.removeEventListener('change', changed));
    }

    /** Moving the pen fires for every sample: it listens outside the zone and only a finished stroke goes back in. */
    private listen(): void {
        const canvas = this.canvasRef().nativeElement;
        const move = (event: PointerEvent) => this.onPointerMove(event);

        this.zone.runOutsideAngular(() => canvas.addEventListener('pointermove', move));
        this.destroyRef.onDestroy(() => canvas.removeEventListener('pointermove', move));
    }

    private resize(): void {
        const canvas = this.canvasRef().nativeElement;
        const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));

        const dpr = window.devicePixelRatio || 1;

        if (width === this.width && height === this.height && dpr === this.dpr) return;

        // The strokes live in CSS pixels, so a resized pad keeps the signature where it was, relatively.
        if (this.width && this.height) {
            this.strokes.update((s) => scaleStrokes(s, width / this.width, height / this.height));
            this.undone.update((s) => scaleStrokes(s, width / this.width, height / this.height));
        }

        this.width = width;
        this.height = height;
        this.dpr = dpr;
        this.cacheDirty = true;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        this.schedule();
    }

    private schedule(): void {
        if (!this.browser || this.frame) return;

        this.frame = requestAnimationFrame(() => {
            this.frame = 0;
            this.paint();
        });
    }

    private paint(): void {
        const canvas = this.canvasRef().nativeElement;
        const ctx = canvas.getContext('2d');

        if (!ctx || !this.width) return;

        const dpr = this.dpr;
        const cache = this.committed(canvas.width, canvas.height, dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);

        // What is drawn already is kept as an image, so a frame of a stroke in progress costs the stroke and not the whole pad.
        if (cache) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(cache, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (this.current) drawStroke(ctx, this.current);
        } else {
            this.render(ctx, this.width, this.height, true);
        }
    }

    /** The pad without the stroke in progress, as an image of the canvas. `null` when it cannot be made. */
    private committed(pixelWidth: number, pixelHeight: number, dpr: number): HTMLCanvasElement | null {
        if (!this.current) return null;

        if (!this.cache) this.cache = document.createElement('canvas');

        const cache = this.cache;

        if (cache.width !== pixelWidth || cache.height !== pixelHeight) {
            cache.width = pixelWidth;
            cache.height = pixelHeight;
            this.cacheDirty = true;
        }

        if (this.cacheDirty) {
            const ctx = cache.getContext('2d');

            if (!ctx) return null;

            const current = this.current;

            this.current = null;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, this.width, this.height);
            this.render(ctx, this.width, this.height, true);
            this.current = current;
            this.cacheDirty = false;
        }

        return cache;
    }

    /** Paints the pad onto any 2D context. `withBackground` adds the background color and image. */
    private render(ctx: CanvasRenderingContext2D, width: number, height: number, withBackground: boolean): void {
        if (withBackground) {
            const color = this.backgroundColor();
            const image = this.bgImage();

            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, width, height);
            }

            if (image) ctx.drawImage(image, 0, 0, width, height);
        }

        const layer = this.layer();

        if (layer) ctx.drawImage(layer.source, 0, 0, width, height);

        for (const stroke of this.strokes()) drawStroke(ctx, stroke);
        if (this.current) drawStroke(ctx, this.current);
    }

    // ---------------------------------------------------------------------------------------------
    // Pen
    // ---------------------------------------------------------------------------------------------

    private point(event: PointerEvent) {
        const rect = this.canvasRef().nativeElement.getBoundingClientRect();

        return { x: event.clientX - rect.left, y: event.clientY - rect.top, t: Math.round(event.timeStamp - this.startTime) };
    }

    protected flushValue(): void {
        this.flush();
    }

    protected onPointerDown(event: PointerEvent): void {
        if (this.locked() || (event.pointerType === 'mouse' && event.button !== 0) || this.current) return;

        const canvas = this.canvasRef().nativeElement;

        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        canvas.focus({ preventScroll: true });
        this.pointerId = event.pointerId;
        this.startTime = event.timeStamp;
        this.current = {
            points: [this.point(event)],
            color: this.strokeColor() || getComputedStyle(this.el.nativeElement).color || '#000',
            minWidth: this.minStrokeWidth(),
            maxWidth: this.maxStrokeWidth(),
            velocity: this.velocity()
        };
        this.drawing.set(true);
        this.schedule();
    }

    protected onPointerMove(event: PointerEvent): void {
        if (!this.current || event.pointerId !== this.pointerId) return;

        const samples = event.getCoalescedEvents?.().length ? event.getCoalescedEvents() : [event];

        for (const sample of samples) this.current.points.push(this.point(sample));

        this.schedule();
    }

    protected onPointerUp(event: PointerEvent): void {
        if (!this.current || event.pointerId !== this.pointerId) return;

        const stroke = this.current;

        this.canvasRef().nativeElement.releasePointerCapture?.(event.pointerId);
        this.current = null;
        this.pointerId = -1;
        this.drawing.set(false);
        this.strokes.update((s) => [...s, stroke]);
        this.undone.set([]);
        this.commit('draw');
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (this.locked()) return;

        const mod = event.metaKey || event.ctrlKey;
        const key = event.key.toLowerCase();

        if (mod && key === 'z' && !event.shiftKey) this.undo();
        else if ((mod && key === 'z' && event.shiftKey) || (mod && key === 'y')) this.redo();
        else if (key === 'delete' || key === 'backspace')
            this.clear(); // `undo` brings it back
        else return;

        event.preventDefault();
    }

    // ---------------------------------------------------------------------------------------------
    // Value
    // ---------------------------------------------------------------------------------------------

    private commit(type: SignatureChangeEvent['type']): void {
        // Anything but a clear drops what a clear took away: it can only be taken back right after it.
        if (type !== 'clear') this.cleared = null;

        const delay = this.valueDebounce();

        if (delay > 0 && type === 'draw' && this.browser) {
            // The strokes are joined into one encoding. The event goes out now; the value follows.
            this.pendingCommit = type;
            clearTimeout(this.commitTimer);
            this.commitTimer = setTimeout(() => this.flush(), delay);
            this.changed.emit({ type, empty: this.isEmpty() });

            return;
        }

        this.flush(type);
        this.changed.emit({ type, empty: this.isEmpty() });
    }

    /** Writes the value now, with what is on the pad. */
    private flush(type?: SignatureChangeEvent['type']): void {
        clearTimeout(this.commitTimer);

        if (!type && !this.pendingCommit) return;

        this.pendingCommit = null;

        const next = this.isEmpty() || !this.browser ? null : this.toDataUrl('png', false);

        this.lastEmitted = next;
        this.value.set(next);
        this.onModelChange(next);
    }

    private async showValue(url: string): Promise<void> {
        const token = ++this.loadToken;

        try {
            const image = await loadImage(url);

            if (token !== this.loadToken) return;

            this.cleared = null;
            this.strokes.set([]);
            this.undone.set([]);
            this.layer.set({ source: image, url });
        } catch {
            /* a value that is not an image leaves the pad as it was */
        }
    }

    private wipe(): void {
        this.loadToken++;
        this.cleared = null;
        this.strokes.set([]);
        this.undone.set([]);
        this.layer.set(null);
    }

    writeControlValue(value: any): void {
        this.value.set(typeof value === 'string' && value ? value : null);
        this.cd.markForCheck();
    }

    private toDataUrl(type: SignatureFileType, withBackground: boolean): string {
        if (!this.browser) return '';

        const dpr = window.devicePixelRatio || 1;

        if (type === 'svg') {
            const image = this.layer()?.url ?? null;
            const background = withBackground ? this.backgroundColor() : null;
            const bgUrl = withBackground ? this.backgroundImage() : '';
            const svg = toSvg(this.strokes(), { width: this.width, height: this.height, background, image });
            // The pad's background image goes under everything else.
            const withBgImage = bgUrl ? svg.replace(/(<svg[^>]*>)(<rect[^>]*\/>)?/, (_all, open: string, rect = '') => `${open}${rect}<image href="${escapeAttr(bgUrl)}" width="${this.width}" height="${this.height}"/>`) : svg;

            return svgToDataUrl(withBgImage);
        }

        const canvas = document.createElement('canvas');

        canvas.width = Math.round(this.width * dpr);
        canvas.height = Math.round(this.height * dpr);

        const ctx = canvas.getContext('2d')!;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // A JPEG has no alpha: without a fill it would come out black.
        if (type === 'jpeg' && !(withBackground && this.backgroundColor())) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, this.width, this.height);
        }

        this.render(ctx, this.width, this.height, withBackground);

        return canvas.toDataURL(`image/${type}`);
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** Empties the pad. Mirrors Syncfusion's `clear`. */
    clear(): void {
        if (this.isEmpty() || this.locked()) return;

        // What was on the pad is kept, so that an `undo` right after brings it back.
        const taken = { strokes: this.strokes(), undone: this.undone(), layer: this.layer() };

        this.wipe();
        this.commit('clear');
        this.cleared = taken;
    }

    /** Takes the last stroke back. Mirrors Syncfusion's `undo`. */
    undo(): void {
        const strokes = this.strokes();

        if (this.locked()) return;

        if (!strokes.length && this.cleared && this.isEmpty()) {
            const { strokes: back, undone, layer } = this.cleared;

            this.cleared = null;
            this.strokes.set(back);
            this.undone.set(undone);
            this.layer.set(layer);
            this.commit('undo');

            return;
        }

        if (!strokes.length) return;

        this.undone.update((u) => [...u, strokes[strokes.length - 1]]);
        this.strokes.set(strokes.slice(0, -1));
        this.commit('undo');
    }

    /** Puts back the stroke `undo` took. Mirrors Syncfusion's `redo`. */
    redo(): void {
        const undone = this.undone();

        if (!undone.length || this.locked()) return;

        this.strokes.update((s) => [...s, undone[undone.length - 1]]);
        this.undone.set(undone.slice(0, -1));
        this.commit('redo');
    }

    /** `true` when there is a stroke to take back. Mirrors Syncfusion's `canUndo`. */
    canUndo(): boolean {
        return this.strokes().length > 0 || (!!this.cleared && this.isEmpty());
    }

    /** `true` when there is a stroke to put back. Mirrors Syncfusion's `canRedo`. */
    canRedo(): boolean {
        return this.undone().length > 0;
    }

    /** The signature as a data URL. Mirrors Syncfusion's `getSignature`. */
    getSignature(type: SignatureFileType = 'png'): string {
        return this.toDataUrl(type, this.saveWithBackground());
    }

    /** The signature as a `Blob`. Mirrors Syncfusion's `saveAsBlob`. */
    async saveAsBlob(type: SignatureFileType = 'png'): Promise<Blob> {
        return (await fetch(this.getSignature(type))).blob();
    }

    /** Downloads the signature. Mirrors Syncfusion's `save`. Returns the data URL, or `null` when cancelled. */
    save(type: SignatureFileType = 'png', fileName = 'Signature'): string | null {
        if (!this.browser) return null;

        const event: SignatureBeforeSaveEvent = { type, fileName, cancel: false };

        this.beforeSave.emit(event);

        if (event.cancel) return null;

        const dataUrl = this.getSignature(event.type);
        const link = document.createElement('a');

        link.href = dataUrl;
        link.download = `${event.fileName}.${event.type === 'jpeg' ? 'jpg' : event.type}`;
        link.click();
        this.saved.emit({ type: event.type, fileName: event.fileName, dataUrl });

        return dataUrl;
    }

    /** Draws an image over the pad, replacing what was on it. Mirrors Syncfusion's `loadSignature`. */
    async loadSignature(url: string): Promise<void> {
        const token = ++this.loadToken;
        const image = await loadImage(url);

        // A newer load, a wipe or the end of the component cancels this one.
        if (token !== this.loadToken) return;

        this.strokes.set([]);
        this.undone.set([]);
        this.layer.set({ source: image, url });
        this.commit('load');
    }

    /** Writes `text` as a typed signature, replacing what was on the pad. Mirrors Syncfusion's `draw`. */
    draw(text: string, fontFamily = 'Brush Script MT, cursive', fontSize = 36): void {
        if (!text || !this.width || !this.browser) return;

        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');

        canvas.width = Math.round(this.width * dpr);
        canvas.height = Math.round(this.height * dpr);

        const ctx = canvas.getContext('2d')!;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = this.strokeColor() || getComputedStyle(this.el.nativeElement).color || '#000';
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.width / 2, this.height / 2, this.width - 16);

        this.strokes.set([]);
        this.undone.set([]);
        this.layer.set({ source: canvas, url: canvas.toDataURL('image/png') });
        this.commit('load');
    }

    /** Moves the focus onto the pad. A signal form calls it to focus the field. */
    focus(options?: FocusOptions): void {
        this.canvasRef().nativeElement.focus(options);
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Signature, SharedModule],
    exports: [Signature, SharedModule]
})
export class SignatureModule {}
