import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    inject,
    input,
    NgZone,
    model,
    NgModule,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    TemplateRef,
    untracked,
    ViewEncapsulation
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { DashboardChangeEvent, DashboardInteractionEvent, DashboardLayoutPassThrough, DashboardPanelContext, DashboardResizeHandle, PanelModel } from '@openng/optimus-ui/types/dashboardlayout';
import { clampPanel, findSpot, heightOf, metrics, moveTo, overlaps, resizeTo, resolve, rowsOf, sameLayout, stack, toCell, toPixels, toSpan, type GridMetrics, type GridPanel } from './dashboardlayout-engine';
import { DashboardLayoutStyle } from './style/dashboardlayoutstyle';

/** One pixel box. */
interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** A drag or a resize in progress. */
interface Session {
    kind: 'move' | 'resize';
    id: string;
    handle?: DashboardResizeHandle;
    pointerId: number;
    startX: number;
    startY: number;
    origin: Box;
    startPanel: GridPanel;
    started: boolean;
    key: string;
}

/** What the panels look like while a session runs. */
interface Live {
    id: string;
    box: Box;
    layout: GridPanel[];
    target: GridPanel;
}

const INTERACTIVE = 'button, a[href], input, select, textarea, label, [contenteditable=""], [contenteditable="true"], [data-no-drag]';
const ARROWS: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };

let nextId = 0;

/**
 * DashboardLayout arranges panels on a grid. The user drags a panel to move it and drags its edge to
 * resize it, and the others make way. With the keyboard, Alt and the arrow keys move the focused panel and
 * Shift and the arrow keys resize it.
 *
 * The API covers `columns`, `cellSpacing`, `cellAspectRatio`, `allowDragging`,
 * `allowResizing`, `allowFloating`, `draggableHandle`, `resizableHandles`, `mediaQuery`, `panels`, the `created`,
 * `dragStart`, `drag`, `dragStop`, `resizeStart`, `resize` and `resizeStop` events, and the `addPanel`, `removePanel`, `removeAll`,
 * `movePanel`, `resizePanel`, `updatePanel`, `serialize` and `refresh` methods. The `change` event is `layoutChanged`
 * here, so that it does not collide with the browser's own.
 *
 * @group Components
 */
@Component({
    selector: 'p-dashboardlayout, p-dashboardLayout, p-dashboard-layout',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule, Bind],
    template: `
        <div [class]="cx('grid')" role="group" [attr.aria-label]="ariaLabel() || defaultLabel()" [attr.aria-describedby]="helpId" [style.height.px]="gridHeight()">
            @if (live(); as l) {
                <div [class]="cx('placeholder')" aria-hidden="true" [style.transform]="'translate(' + target().x + 'px,' + target().y + 'px)'" [style.width.px]="target().w" [style.height.px]="target().h"></div>
            }
            @for (panel of items(); track panel.id) {
                @let b = boxOf(panel);
                <div
                    [class]="cx('panel', { panel })"
                    role="group"
                    [id]="panelId(panel.id)"
                    [attr.tabindex]="panel.enabled === false ? null : 0"
                    [attr.aria-roledescription]="canDrag(panel) ? 'draggable panel' : null"
                    [attr.aria-label]="titleOf(panel)"
                    [style.transform]="'translate(' + b.x + 'px,' + b.y + 'px)'"
                    [style.width.px]="b.w"
                    [style.height.px]="b.h"
                    [style.z-index]="isActive(panel.id) ? 10 : (panel.zIndex ?? null)"
                    (pointerdown)="onPointerDown($event, panel)"
                    (pointerup)="onPointerUp($event)"
                    (pointercancel)="onPointerCancel($event)"
                    (keydown)="onKeydown($event, panel)"
                >
                    @if (headerTpl() || panel.header) {
                        <div [class]="cx('header')" [pBind]="ptm('header')">
                            @if (headerTpl(); as tpl) {
                                <ng-container *ngTemplateOutlet="tpl; context: { $implicit: panel, id: panel.id }" />
                            } @else {
                                {{ panel.header }}
                            }
                        </div>
                    }
                    <div [class]="cx('content')" [pBind]="ptm('content')">
                        @if (panelTpl(); as tpl) {
                            <ng-container *ngTemplateOutlet="tpl; context: { $implicit: panel, id: panel.id }" />
                        } @else {
                            {{ panel.content }}
                        }
                    </div>
                    @if (canResize(panel)) {
                        @for (h of resizableHandles(); track h) {
                            <span [class]="cx('handle', { handle: h })" aria-hidden="true" (pointerdown)="onResizeDown($event, panel, h)"></span>
                        }
                    }
                </div>
            }
        </div>
        <p [id]="helpId" class="p-dashboardlayout-sr">{{ helpText() }}</p>
        <div class="p-dashboardlayout-sr" role="status" aria-live="polite" aria-atomic="true">{{ announcement() }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DashboardLayoutStyle, { provide: PARENT_INSTANCE, useExisting: DashboardLayout }],
    host: { '[class]': 'cx("root")', 'data-scope': 'dashboardlayout', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class DashboardLayout extends BaseComponent<DashboardLayoutPassThrough> {
    componentName = 'DashboardLayout';

    /** @internal */
    _componentStyle = inject(DashboardLayoutStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly uid = nextId++;

    /** @internal */
    readonly helpId = `p-dashboardlayout-help-${this.uid}`;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The panels. Supports `[(panels)]`: a drag, a resize or a method hands back the new layout.
     * @group Props
     */
    readonly panels = model<PanelModel[]>([]);
    /**
     * How many columns the grid has.
     * @group Props
     */
    readonly columns = input(12, { transform: numberAttribute });
    /**
     * Space between cells, in pixels: one number, or `[horizontal, vertical]`.
     * @group Props
     */
    readonly cellSpacing = input<number | [number, number]>(8);
    /**
     * How wide a cell is for each unit of height: 1 is square, 2 is twice as wide as tall.
     * @group Props
     */
    readonly cellAspectRatio = input(1, { transform: numberAttribute });
    /**
     * Lets the user move panels.
     * @group Props
     */
    readonly allowDragging = input(true, { transform: booleanAttribute });
    /**
     * Lets the user resize panels.
     * @group Props
     */
    readonly allowResizing = input(false, { transform: booleanAttribute });
    /**
     * Pulls panels up to close the gaps above them.
     * @group Props
     */
    readonly allowFloating = input(true, { transform: booleanAttribute });
    /**
     * A CSS selector inside the panel that the user drags it by. Omitted, any part of the panel that is not a control drags it.
     * @group Props
     */
    readonly draggableHandle = input<string | undefined>(undefined);
    /**
     * The edges and corners that resize a panel.
     * @group Props
     */
    readonly resizableHandles = input<DashboardResizeHandle[]>(['se']);
    /**
     * A media query, for example `max-width: 700px`, under which the panels stack in one column and cannot be moved.
     * @group Props
     */
    readonly mediaQuery = input<string | undefined>(undefined);
    /**
     * Accessible name of the dashboard.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    /**
     * Accessible name of the dashboard when `aria-label` is not set.
     * @group Props
     */
    readonly defaultLabel = input('Dashboard');
    /**
     * Keyboard instructions read to assistive technology.
     * @group Props
     */
    readonly helpText = input('Alt and the arrow keys move a panel. Shift and the arrow keys resize it.');
    /**
     * Announcement after a panel moved. `{title}`, `{row}` and `{col}` are replaced.
     * @group Props
     */
    readonly movedText = input('{title} moved to row {row}, column {col}');
    /**
     * Announcement after a panel was resized. `{title}`, `{sizeX}` and `{sizeY}` are replaced.
     * @group Props
     */
    readonly resizedText = input('{title} is now {sizeX} by {sizeY}');

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /** Fires once, when the dashboard is ready. @group Emits */
    readonly created = output<void>();
    /** Fires when a layout change was made, by the user or by a method. @group Emits */
    readonly layoutChanged = output<DashboardChangeEvent>();
    /** Fires when a drag begins. Set `cancel` to stop it. @group Emits */
    readonly dragStart = output<DashboardInteractionEvent>();
    /** Fires as a panel is dragged. @group Emits */
    readonly drag = output<DashboardInteractionEvent>();
    /** Fires when a drag ends. @group Emits */
    readonly dragStop = output<DashboardInteractionEvent>();
    /** Fires when a resize begins. Set `cancel` to stop it. @group Emits */
    readonly resizeStart = output<DashboardInteractionEvent>();
    /** Fires as a panel is resized. @group Emits */
    readonly resize = output<DashboardInteractionEvent>();
    /** Fires when a resize ends. @group Emits */
    readonly resizeStop = output<DashboardInteractionEvent>();

    // ---------------------------------------------------------------------------------------------
    // Templates
    // ---------------------------------------------------------------------------------------------

    /** Template of a panel body. Reference it as `#panel`. Context: `$implicit` (the panel), `id`. @group Templates */
    readonly panelTpl = contentChild<TemplateRef<DashboardPanelContext>>('panel');
    /** Template of a panel header. Reference it as `#header`. @group Templates */
    readonly headerTpl = contentChild<TemplateRef<DashboardPanelContext>>('header');

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    private readonly width = signal(1200);
    /** `true` under the `mediaQuery`. @internal */
    readonly narrow = signal(false);
    /** @internal */
    readonly live = signal<Live | null>(null);
    /** @internal */
    readonly announcement = signal('');
    private session: Session | null = null;
    private readonly zone = inject(NgZone);

    /** `true` while a drag or a resize runs. @internal */
    readonly busy = computed(() => !!this.live());

    /** The columns, kept to a whole number the grid can use: anything else (`NaN`, zero, a negative) falls back to 12. */
    private readonly cols = computed(() => {
        if (this.narrow()) return 1;

        const columns = Math.round(this.columns());

        return Number.isFinite(columns) && columns >= 1 ? Math.min(columns, 1000) : 12;
    });
    private readonly gaps = computed<[number, number]>(() => {
        const s = this.cellSpacing();

        return Array.isArray(s) ? s : [s, s];
    });
    private readonly grid = computed<GridMetrics>(() => metrics(this.width(), this.cols(), this.gaps()[0], this.gaps()[1], this.cellAspectRatio()));

    /** The layout at rest: the model, settled. */
    private readonly settled = computed<GridPanel[]>(() => (this.narrow() ? stack(this.panels()) : resolve(this.panels(), this.cols(), this.allowFloating())));

    /** What is drawn: the preview while a session runs, else the layout at rest. @internal */
    readonly items = computed<GridPanel[]>(() => this.live()?.layout ?? this.settled());

    private readonly boxes = computed(() => {
        const g = this.grid();
        const live = this.live();
        const map = new Map<string, Box>();

        for (const p of this.items()) map.set(p.id, live && live.id === p.id ? live.box : toPixels(p, g));

        return map;
    });

    /** The box of the drop placeholder. @internal */
    readonly target = computed<Box>(() => {
        const live = this.live();

        return live ? toPixels(live.target, this.grid()) : { x: 0, y: 0, w: 0, h: 0 };
    });

    /** @internal */
    readonly gridHeight = computed(() => heightOf(rowsOf(this.items()), this.grid()));

    constructor() {
        super();

        afterNextRender(() => {
            const host = this.el.nativeElement as HTMLElement;
            const move = (event: Event) => this.onPointerMove(event as PointerEvent);

            // Measuring and following the pointer are frequent, and only change a signal: no reason to run change detection for them.
            this.zone.runOutsideAngular(() => {
                const observer = new ResizeObserver(() => this.measure());

                observer.observe(host);
                host.addEventListener('pointermove', move);
                this.destroyRef.onDestroy(() => {
                    observer.disconnect();
                    host.removeEventListener('pointermove', move);
                });
            });
            this.measure();
            this.created.emit();
        });

        effect((onCleanup) => {
            const query = this.mediaQuery();

            if (!query || !this.browser) return untracked(() => this.narrow.set(false));

            const media = window.matchMedia(/^\s*\(/.test(query) ? query : `(${query})`);
            const update = () => this.narrow.set(media.matches);

            update();
            media.addEventListener('change', update);
            onCleanup(() => media.removeEventListener('change', update));
        });
    }

    private measure(): void {
        const w = (this.el.nativeElement as HTMLElement).getBoundingClientRect().width;

        if (w > 0) this.width.set(w);
    }

    // ---------------------------------------------------------------------------------------------
    // Template helpers
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    boxOf(panel: GridPanel): Box {
        return this.boxes().get(panel.id) ?? { x: 0, y: 0, w: 0, h: 0 };
    }

    /** @internal */
    panelId(id: string): string {
        return `p-dashboardlayout-${this.uid}-${id}`;
    }

    /** @internal */
    titleOf(panel: PanelModel): string {
        return panel.header || panel.id;
    }

    /** @internal */
    isActive(id: string): boolean {
        return this.live()?.id === id;
    }

    /** @internal */
    canDrag(panel: PanelModel): boolean {
        return this.allowDragging() && !this.narrow() && panel.enabled !== false;
    }

    /** @internal */
    canResize(panel: PanelModel): boolean {
        return this.allowResizing() && !this.narrow() && panel.enabled !== false;
    }

    // ---------------------------------------------------------------------------------------------
    // Pointer
    // ---------------------------------------------------------------------------------------------

    private event(panel: PanelModel, originalEvent: Event): DashboardInteractionEvent {
        return { panel: { ...panel }, originalEvent, cancel: false };
    }

    private begin(event: PointerEvent, panel: GridPanel, kind: Session['kind'], handle?: DashboardResizeHandle): void {
        const origin = this.boxOf(panel);

        this.session = { kind, id: panel.id, handle, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin, startPanel: panel, started: false, key: '' };
    }

    /** @internal */
    onPointerDown(event: PointerEvent, panel: GridPanel): void {
        if (this.session || !this.canDrag(panel) || (event.pointerType === 'mouse' && event.button !== 0)) return;

        const target = event.target as HTMLElement;
        const el = event.currentTarget as HTMLElement;

        if (target.closest(INTERACTIVE) && el.contains(target.closest(INTERACTIVE))) return;

        const handle = this.draggableHandle();

        if (handle && !target.closest(handle)) return;

        this.begin(event, panel, 'move');
        el.setPointerCapture?.(event.pointerId);
    }

    /** @internal */
    onResizeDown(event: PointerEvent, panel: GridPanel, handle: DashboardResizeHandle): void {
        if (this.session || !this.canResize(panel) || (event.pointerType === 'mouse' && event.button !== 0)) return;

        event.stopPropagation();
        event.preventDefault();
        this.begin(event, panel, 'resize', handle);
        (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    }

    /** @internal */
    onPointerMove(event: PointerEvent): void {
        const s = this.session;

        if (!s || event.pointerId !== s.pointerId) return;

        const dx = event.clientX - s.startX;
        const dy = event.clientY - s.startY;

        if (!s.started) {
            if (Math.hypot(dx, dy) < 4) return;

            const start = this.event(s.startPanel, event);

            this.zone.run(() => (s.kind === 'move' ? this.dragStart : this.resizeStart).emit(start));

            if (start.cancel) return this.end(false);

            s.started = true;
        }

        event.preventDefault();

        const g = this.grid();
        const cols = this.cols();
        const base = this.settled();
        const p = s.startPanel;
        let box: Box;
        let target: GridPanel;

        if (s.kind === 'move') {
            const x = Math.min(Math.max(s.origin.x + dx, 0), Math.max(this.width() - s.origin.w, 0));
            const y = Math.max(s.origin.y + dy, 0);
            const cell = toCell(x, y, g);

            box = { ...s.origin, x, y };
            target = clampPanel({ ...p, row: Math.max(cell.row, 0), col: cell.col }, cols);
        } else {
            const h = s.handle!;
            const minW = g.cellW;
            const minH = g.cellH;
            let { x, y, w, h: ht } = s.origin;

            if (h.includes('e')) w = Math.min(Math.max(s.origin.w + dx, minW), this.width() - x);
            if (h.includes('s')) ht = Math.max(s.origin.h + dy, minH);

            if (h.includes('w')) {
                const right = s.origin.x + s.origin.w;

                x = Math.min(Math.max(s.origin.x + dx, 0), right - minW);
                w = right - x;
            }

            if (h.includes('n')) {
                const bottom = s.origin.y + s.origin.h;

                y = Math.min(Math.max(s.origin.y + dy, 0), bottom - minH);
                ht = bottom - y;
            }

            box = { x, y, w, h: ht };

            const span = toSpan(w, ht, g);
            const clamped = clampPanel({ ...p, sizeX: span.sizeX, sizeY: span.sizeY }, cols);

            // A west or north edge keeps the opposite edge where it was.
            target = { ...clamped, col: h.includes('w') ? p.col + p.sizeX - clamped.sizeX : p.col, row: h.includes('n') ? Math.max(p.row + p.sizeY - clamped.sizeY, 0) : p.row };
            target = clampPanel(target, cols);
        }

        const key = `${target.row}:${target.col}:${target.sizeX}:${target.sizeY}`;
        let layout = this.live()?.layout ?? base;

        if (key !== s.key) {
            s.key = key;
            layout = s.kind === 'move' ? moveTo(base, p.id, target.row, target.col, cols, this.allowFloating()) : resizeTo(base, p.id, target, cols, this.allowFloating());
        }

        // The placeholder shows where the panel will land, which can differ from the cell it was dropped on once the others have settled.
        const settledTarget = layout.find((q) => q.id === p.id) ?? target;

        this.live.set({ id: p.id, box, layout, target: settledTarget });
        this.zone.run(() => (s.kind === 'move' ? this.drag : this.resize).emit(this.event(settledTarget, event)));
    }

    /** @internal */
    onPointerUp(event: PointerEvent): void {
        const s = this.session;

        if (!s || event.pointerId !== s.pointerId) return;

        const live = this.live();

        if (s.started && live) {
            const previous = this.panels();
            const moved = live.layout.find((q) => q.id === s.id)!;

            (s.kind === 'move' ? this.dragStop : this.resizeStop).emit(this.event(moved, event));
            this.end(true);
            this.commit(live.layout, s.kind === 'move' ? 'drag' : 'resize', moved, previous);
            this.say(s.kind === 'move' ? this.movedMessage(moved) : this.resizedMessage(moved));
        } else {
            this.end(false);
        }
    }

    /** @internal */
    onPointerCancel(event: PointerEvent): void {
        if (this.session && event.pointerId === this.session.pointerId) this.end(false);
    }

    private end(_committed: boolean): void {
        this.session = null;
        this.live.set(null);
    }

    // ---------------------------------------------------------------------------------------------
    // Keyboard
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    onKeydown(event: KeyboardEvent, panel: GridPanel): void {
        if (event.key === 'Escape' && this.session) {
            this.end(false);
            event.preventDefault();

            return;
        }

        const delta = ARROWS[event.key];

        if (!delta || panel.enabled === false || this.narrow() || (event.target as HTMLElement).closest(INTERACTIVE)) return;

        const cols = this.cols();
        const base = this.settled();
        let next: GridPanel[];
        let message: string;

        if (event.altKey && this.allowDragging()) {
            const row = Math.max(panel.row + delta[0], 0);
            const col = Math.min(Math.max(panel.col + delta[1], 0), cols - panel.sizeX);

            next = moveTo(base, panel.id, row, col, cols, this.allowFloating());

            const now = next.find((q) => q.id === panel.id)!;

            message = this.movedMessage(now);
        } else if (event.shiftKey && this.allowResizing()) {
            next = resizeTo(base, panel.id, { row: panel.row, col: panel.col, sizeX: panel.sizeX + delta[1], sizeY: panel.sizeY + delta[0] }, cols, this.allowFloating());

            const now = next.find((q) => q.id === panel.id)!;

            message = this.resizedMessage(now);
        } else {
            return;
        }

        event.preventDefault();

        if (sameLayout(next, base)) return;

        this.commit(
            next,
            'keyboard',
            next.find((q) => q.id === panel.id)!
        );
        this.say(message);
        // The panel keeps the focus: its element is the same one, only moved.
    }

    private movedMessage(panel: GridPanel): string {
        return this.fill(this.movedText(), { title: this.titleOf(panel), row: panel.row + 1, col: panel.col + 1 });
    }

    private resizedMessage(panel: GridPanel): string {
        return this.fill(this.resizedText(), { title: this.titleOf(panel), sizeX: panel.sizeX, sizeY: panel.sizeY });
    }

    private fill(template: string, values: Record<string, string | number>): string {
        return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
    }

    private say(message: string): void {
        // The same words twice change nothing for a live region, and a screen reader stays quiet: a no-break space makes the second one new.
        this.announcement.set(message === this.announcement() ? `${message}\u00A0` : message);
    }

    // ---------------------------------------------------------------------------------------------
    // Commit
    // ---------------------------------------------------------------------------------------------

    private commit(next: GridPanel[], type: DashboardChangeEvent['type'], panel?: PanelModel, previous: PanelModel[] = this.panels()): void {
        this.panels.set(next);
        this.layoutChanged.emit({ type, previous, panels: next, panel });
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** Adds a panel. Without a `row` and a `col` it goes in the first free place. */
    addPanel(panel: Omit<PanelModel, 'row' | 'col'> & Partial<Pick<PanelModel, 'row' | 'col'>>): void {
        const cols = this.cols();
        const current = this.settled();
        const placed = (panel.row === undefined || panel.col === undefined ? { ...panel, ...findSpot(current, panel.sizeX ?? 1, panel.sizeY ?? 1, cols) } : panel) as PanelModel;
        const next = resolve([...current, placed], cols, this.allowFloating(), placed.id);

        this.commit(
            next,
            'add',
            next.find((q) => q.id === placed.id)
        );
    }

    /** Removes a panel. */
    removePanel(id: string): void {
        const panel = this.panels().find((p) => p.id === id);

        if (!panel) return;

        this.commit(
            resolve(
                this.panels().filter((p) => p.id !== id),
                this.cols(),
                this.allowFloating()
            ),
            'remove',
            panel
        );
    }

    /** Removes every panel. */
    removeAll(): void {
        this.commit([], 'clear');
    }

    /** Moves a panel. */
    movePanel(id: string, row: number, col: number): void {
        if (!this.panels().some((p) => p.id === id)) return;

        const next = moveTo(this.settled(), id, row, col, this.cols(), this.allowFloating());

        this.commit(
            next,
            'move',
            next.find((q) => q.id === id)
        );
    }

    /** Resizes a panel. */
    resizePanel(id: string, sizeX: number, sizeY: number): void {
        const panel = this.settled().find((p) => p.id === id);

        if (!panel) return;

        const next = resizeTo(this.settled(), id, { row: panel.row, col: panel.col, sizeX, sizeY }, this.cols(), this.allowFloating());

        this.commit(
            next,
            'update',
            next.find((q) => q.id === id)
        );
    }

    /** Changes properties of a panel: header, content, limits, anything but its identity. */
    updatePanel(patch: Partial<PanelModel> & { id: string }): void {
        if (!this.panels().some((p) => p.id === patch.id)) return;

        const next = resolve(
            this.settled().map((p) => (p.id === patch.id ? { ...p, ...patch } : p)),
            this.cols(),
            this.allowFloating(),
            patch.id
        );

        this.commit(
            next,
            'update',
            next.find((q) => q.id === patch.id)
        );
    }

    /** The layout as it is on screen, ready to store. */
    serialize(): PanelModel[] {
        return this.settled().map((p) => ({ ...p }));
    }

    /** Measures the dashboard again. */
    refresh(): void {
        this.measure();
    }

    /** `true` when `a` and `b` share a cell. */
    static overlaps = overlaps;
}

/**
 * @group Modules
 */
@NgModule({
    imports: [DashboardLayout, SharedModule],
    exports: [DashboardLayout, SharedModule]
})
export class DashboardLayoutModule {}
