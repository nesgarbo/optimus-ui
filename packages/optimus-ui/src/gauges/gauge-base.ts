import { isPlatformBrowser } from '@angular/common';
import { booleanAttribute, DestroyRef, Directive, effect, inject, input, NgZone, PLATFORM_ID, signal, untracked } from '@angular/core';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { GaugePassThrough } from '@openng/optimus-ui/types/gauges';
import { GaugeStyle } from './style/gaugestyle';

/** A pointer value on its way to a new one. */
interface Run {
    from: number;
    to: number;
    duration: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const cssSize = (value: string | number | undefined, fallback: string) => (value === undefined || value === '' ? fallback : typeof value === 'number' ? `${value}px` : value);

/**
 * What the two gauges share: the box, the title, the accessible name, and the animation of pointer values.
 * @internal
 */
@Directive({ standalone: true })
export abstract class GaugeBase extends BaseComponent<GaugePassThrough> {
    /** @internal */
    _componentStyle = inject(GaugeStyle);

    protected readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly zone = inject(NgZone);
    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** `circular` or `linear`. @internal */
    abstract readonly kind: 'circular' | 'linear';
    /** `true` when the user can change a value. @internal */
    abstract readonly interactive: () => boolean;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Width of the gauge, as a CSS length or pixels.
     * @group Props
     */
    readonly width = input<string | number>('100%');
    /**
     * Height of the gauge. `auto` keeps the proportions of the drawing.
     * @group Props
     */
    readonly height = input<string | number>('auto');
    /**
     * A heading over the gauge.
     * @group Props
     */
    readonly title = input<string | undefined>(undefined);
    /**
     * Turns the animation of pointers off for the whole gauge.
     * @group Props
     */
    readonly animate = input(true, { transform: booleanAttribute });
    /**
     * Accessible name. Defaults to the title.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    /**
     * Accessible name when neither `aria-label` nor `title` is set.
     * @group Props
     */
    readonly defaultLabel = input('Gauge');
    /**
     * Text of a range with no `legendText`. `{start}` and `{end}` are replaced.
     * @group Props
     */
    readonly rangeText = input('{start} to {end}');

    /** The text of a range. @internal */
    protected rangeLabel(r: { start: number; end: number; legendText?: string }): string {
        return r.legendText ?? this.rangeText().replace('{start}', String(r.start)).replace('{end}', String(r.end));
    }

    /**
     * Listens to the pointer moving over `el` outside the zone: it fires for every hover, and only a drag has work to do.
     * @internal
     */
    protected followPointer(el: Element, handler: (event: PointerEvent) => void): void {
        const listener = (event: Event) => handler(event as PointerEvent);

        this.zone.runOutsideAngular(() => el.addEventListener('pointermove', listener));
        this.destroyRef.onDestroy(() => el.removeEventListener('pointermove', listener));
    }

    /** @internal */
    protected hostWidth(): string {
        return cssSize(this.width(), '100%');
    }

    /** @internal */
    protected svgHeight(): string {
        return cssSize(this.height(), 'auto');
    }

    // ---------------------------------------------------------------------------------------------
    // Animation
    // ---------------------------------------------------------------------------------------------

    private readonly shownValues = signal<Record<string, number>>({});
    private runs: Record<string, Run> = {};
    private frame = 0;
    private started = 0;
    private first = true;

    /** The value of each pointer as drawn, by key. @internal */
    protected readonly shown = this.shownValues.asReadonly();

    /** The value each pointer is heading for, by key; and the least value of its axis, where it starts from. */
    protected abstract readonly targets: () => Record<string, { value: number; start: number; duration: number }>;

    /** Called when every pointer has arrived. */
    protected abstract onAnimationDone(): void;

    protected reducedMotion(): boolean {
        return this.browser && typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    protected startAnimation(): void {
        effect(() => {
            const targets = this.targets();
            const animate = this.animate();

            untracked(() => {
                const current = this.shownValues();
                const next: Record<string, number> = {};
                const runs: Record<string, Run> = {};
                let any = false;

                for (const [key, t] of Object.entries(targets)) {
                    const from = key in current ? current[key] : this.first ? t.start : t.value;

                    if (animate && this.browser && !this.reducedMotion() && t.duration > 0 && from !== t.value) {
                        runs[key] = { from, to: t.value, duration: t.duration };
                        next[key] = from;
                        any = true;
                    } else {
                        next[key] = t.value;
                    }
                }

                this.first = false;
                this.runs = runs;
                this.shownValues.set(next);

                if (any) this.loop();
                else if (this.browser) cancelAnimationFrame(this.frame);
            });
        });

        this.destroyRef.onDestroy(() => this.browser && cancelAnimationFrame(this.frame));
    }

    private loop(): void {
        cancelAnimationFrame(this.frame);
        this.started = performance.now();

        // The frames only write a signal; the zone is entered once, when the pointers have arrived.
        this.zone.runOutsideAngular(() => this.runFrames());
    }

    private runFrames(): void {
        const step = (now: number) => {
            const elapsed = now - this.started;
            const next = { ...untracked(this.shownValues) };
            let running = false;

            for (const [key, run] of Object.entries(this.runs)) {
                const t = Math.min(elapsed / run.duration, 1);

                next[key] = run.from + (run.to - run.from) * easeOutCubic(t);

                if (t < 1) running = true;
                else delete this.runs[key];
            }

            this.shownValues.set(next);

            if (running) this.frame = requestAnimationFrame(step);
            else this.zone.run(() => this.onAnimationDone());
        };

        this.frame = requestAnimationFrame(step);
    }
}
