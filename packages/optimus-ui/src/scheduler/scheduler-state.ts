import { InjectionToken, Signal, computed, signal } from '@angular/core';
import type { SchedulerBlockedInterval, SchedulerCategory, SchedulerDateSelectionMode, SchedulerDragPayload, SchedulerDropInfo, SchedulerEvent, SchedulerResource, SchedulerViewType } from '@openng/optimus-ui/types/scheduler';
import { addDays, dayKey, formatTimeRange, navigate, startOfDay, timelineScaleOf, toDate, viewRange, type SchedulerRange } from './scheduler-date';
import { expandEvents } from './scheduler-recurrence';
import { SchedulerDragController, applyPendingChanges, type SchedulerDragTarget, type SchedulerPendingChange } from './scheduler-drag';

/**
 * The Scheduler's single source of truth, shared with every renderer, part and overlay by injection.
 *
 * Pulling it out of the root component is what keeps the compound API free of prop drilling: a
 * renderer or an overlay asks for {@link SchedulerState} and reads the signals it needs, rather than
 * receiving a dozen inputs from a parent that would have to forward them.
 *
 * The application still owns the DATA. This holds the view state (where we are looking, what is
 * selected, which overlay is open) and derives from the bound arrays; it never mutates `events`.
 *
 * @module scheduler-state
 */

/** @internal */
export const SCHEDULER_STATE = new InjectionToken<SchedulerState>('SCHEDULER_STATE');

/**
 * Views this build actually renders.
 *
 * The remaining five the compound API declares (resourceDay, resourceWeek, resourceMonth and the two
 * remaining date views) exist as scopes so their definitions can be declared, but they have no
 * renderer yet, so they are not offered by the view selector.
 *
 * @internal
 */
export const SCHEDULER_IMPLEMENTED_VIEWS: SchedulerViewType[] = [
    'day',
    'week',
    'month',
    'agenda',
    'year',
    'timeline',
    'timelineDay',
    'timelineWeek',
    'timelineMonth',
    'timelineYear',
    'resourceTimeline',
    'resourceTimelineDay',
    'resourceTimelineWeek',
    'resourceTimelineMonth',
    'resourceTimelineYear'
];

/**
 * What an overlay is currently anchored to.
 */
export interface SchedulerOverlayTarget {
    /** The event the overlay is about, when it is an event overlay. */
    event?: SchedulerEvent;
    /** The day the overlay is about, for the overflow popover. */
    date?: Date;
    /** The resource the overlay is about. */
    resource?: SchedulerResource;
    /** Every event of the cell, for the overflow popover. */
    events?: SchedulerEvent[];
    /** The element the overlay should be positioned against. */
    anchor?: HTMLElement;
}

/**
 * Inputs the root feeds into the state. Plain signals so the root can wire its own `input()`s
 * straight through.
 */
export interface SchedulerLabels {
    /** Label of the "today" button. */
    today: string;
    /** Accessible name of the previous-range button. */
    prev: string;
    /** Accessible name of the next-range button. */
    next: string;
    /** Label of the button that clears the event selection. */
    clear: string;
    /** Label shown when a view has no events. */
    empty: string;
    /** Label of the all-day row. */
    allDay: string;
    /** Template of the overflow link; `{0}` is replaced with the count. */
    more: string;
    /** Header of the resource rail. */
    resources: string;
    /** Lane that collects events whose resource is unknown. */
    unassigned: string;
    /** Localised name of each view. */
    views: Record<SchedulerViewType, string>;
}

/**
 * Chrome labels an application overrides.
 *
 * `views` is partial too: a page that renames the week view has no business restating the name of
 * the other twelve, and the merge fills the rest in from the defaults.
 */
export interface SchedulerLabelOverrides extends Partial<Omit<SchedulerLabels, 'views'>> {
    /** Localised name of any subset of the views. */
    views?: Partial<Record<SchedulerViewType, string>>;
}

export interface SchedulerStateInputs {
    events: Signal<SchedulerEvent[]>;
    resources: Signal<SchedulerResource[]>;
    categories: Signal<SchedulerCategory[]>;
    categoryField: Signal<string>;
    titleField: Signal<string>;
    view: Signal<SchedulerViewType>;
    date: Signal<Date>;
    firstDayOfWeek: Signal<number>;
    dayCount: Signal<number>;
    agendaDays: Signal<number>;
    defaultEventDuration: Signal<number>;
    maxEventsPerCell: Signal<number>;
    workDays: Signal<number[]>;
    businessHours: Signal<{ start: number; end: number } | undefined>;
    availableViews: Signal<SchedulerViewType[] | undefined>;
    categoryFilterable: Signal<boolean>;
    loading: Signal<boolean>;
    labels: Signal<SchedulerLabels>;
    locale: Signal<string | undefined>;
    slotMinutes: Signal<number>;
    timelineSlotMinutes: Signal<number>;
    timelineVirtualScroll: Signal<boolean | 'auto'>;
    timelineVirtualThreshold: Signal<number>;
    timelineVirtualOverscan: Signal<number>;
    timelineVirtualEventBuffer: Signal<number>;
    rtl: Signal<boolean>;
    dayStartHour: Signal<number>;
    dayEndHour: Signal<number>;
    minEventMinutes: Signal<number>;
    selectionMode: Signal<'none' | 'single' | 'multiple'>;
    quickInfoEnabled: Signal<boolean>;
    editable: Signal<boolean>;
    eventStartEditable: Signal<boolean>;
    eventDurationEditable: Signal<boolean>;
    snapDuration: Signal<number>;
    timelineSnapDuration: Signal<number | undefined>;
    dragMinDistance: Signal<number>;
    eventAllow: Signal<((info: SchedulerDropInfo) => boolean) | undefined>;
    blockedIntervals: Signal<SchedulerBlockedInterval[]>;
    dateSelection: Signal<SchedulerDateSelectionMode>;
    selectedDates: Signal<Date[]>;
    setSelectedDates: (dates: Date[]) => void;
    emitDragStart: (payload: SchedulerDragPayload) => void;
    emitDrop: (payload: SchedulerDragPayload) => void;
    emitResizeStart: (payload: SchedulerDragPayload) => void;
    emitResize: (payload: SchedulerDragPayload) => void;
    emitResizeStop: (payload: SchedulerDragPayload) => void;
    eventPopoverEnabled: Signal<boolean>;
    contextMenuEnabled: Signal<boolean>;
    maxSelection: Signal<number>;
    setView: (view: SchedulerViewType) => void;
    setDate: (date: Date) => void;
    bulkDelete: (events: SchedulerEvent[]) => void;
    eventChange: (event: SchedulerEvent) => void;
    eventRemove: (event: SchedulerEvent) => void;
    emitEventClick: (originalEvent: MouseEvent, event: SchedulerEvent) => void;
    emitSlotClick: (originalEvent: MouseEvent, start: Date, end: Date) => void;
    emitSelectionLimit: (max: number) => void;
    emitSelectionChange: (events: SchedulerEvent[]) => void;
}

/**
 * The shared, derived view state.
 */
export class SchedulerState {
    constructor(private readonly inputs: SchedulerStateInputs) {}

    /** Active view. */
    readonly view = computed(() => this.inputs.view());

    /** Anchor date the range is derived from. */
    readonly date = computed(() => this.inputs.date());

    /** First day of the week, 0 = Sunday. */
    readonly firstDayOfWeek = computed(() => this.inputs.firstDayOfWeek());

    /** Business hours of a day, as whole hours, or `undefined` when the page did not set any. */
    readonly businessHours = computed(() => this.inputs.businessHours());

    /** Whether the page configured business hours at all, which is what turns the shading on. */
    readonly hasBusinessHours = computed(() => !!this.inputs.businessHours());

    /**
     * Whether an instant falls inside business hours. With none configured every hour counts, which
     * is what leaves the grid unshaded instead of shading all of it.
     */
    isBusinessTime(date: Date, minutes = date.getHours() * 60 + date.getMinutes()): boolean {
        const hours = this.businessHours();
        if (!hours) return true;
        return this.isWorkDay(date) && minutes >= hours.start * 60 && minutes < hours.end * 60;
    }

    /** Week days that count as working days, 0 = Sunday. */
    readonly workDays = computed(() => this.inputs.workDays());

    /** How many events a month cell shows before it collapses into a "+N more" link. */
    readonly maxEventsPerCell = computed(() => this.inputs.maxEventsPerCell());

    /** Duration given to an event with no `end`. */
    readonly defaultEventDuration = computed(() => this.inputs.defaultEventDuration());

    /**
     * Views whose scope is declared inside `<p-scheduler-content>`, in declaration order. Written by
     * the content region as the scopes register themselves.
     */
    readonly declaredViews = signal<readonly SchedulerViewType[]>([]);

    /**
     * Views offered by the view selector.
     *
     * With no `views` input, the list is the scopes the page DECLARED: a Scheduler that only renders
     * a month has no business offering six other views it cannot draw. The full list is the last
     * resort, for a root with no content region at all.
     */
    readonly availableViews = computed<SchedulerViewType[]>(() => {
        // `!= null` y no `?.length`: una lista vacía pasada a propósito es "no ofrezcas ninguna
        // vista", y caer a los scopes declarados en ese caso ignoraría lo que la página pidió.
        const explicit = this.inputs.availableViews();
        if (explicit != null) return explicit;
        const declared = this.declaredViews();
        return declared.length ? [...declared] : SCHEDULER_IMPLEMENTED_VIEWS;
    });

    /** Whether the legend toggles filters. */
    readonly categoryFilterable = computed(() => this.inputs.categoryFilterable());

    /** Whether the Scheduler is waiting on data. */
    readonly loading = computed(() => this.inputs.loading());

    /** Localised labels of the chrome. */
    readonly labels = computed(() => this.inputs.labels());

    /** BCP 47 locale used to format every date the Scheduler prints. */
    readonly locale = computed(() => this.inputs.locale());

    /** Height of one row of the time grid, in minutes. */
    readonly slotMinutes = computed(() => this.inputs.slotMinutes());

    /**
     * Width of one column of a time-based timeline axis, in minutes.
     *
     * Separate from `slotMinutes` because the two axes have opposite constraints: a vertical row can
     * be 30 minutes tall and still fit a title, a horizontal column of 30 minutes is 80px of nothing.
     */
    readonly timelineSlotMinutes = computed(() => this.inputs.timelineSlotMinutes());

    /** Whether the layout runs right to left. */
    readonly rtl = computed(() => this.inputs.rtl());

    /** Whether long timeline axes are windowed. `auto` decides by column count. */
    readonly timelineVirtualScroll = computed(() => this.inputs.timelineVirtualScroll());

    /** Column count past which `auto` windows the axis. */
    readonly timelineVirtualThreshold = computed(() => Math.max(this.inputs.timelineVirtualThreshold(), 1));

    /** Extra columns kept mounted either side of the viewport. */
    readonly timelineVirtualOverscan = computed(() => Math.max(this.inputs.timelineVirtualOverscan(), 0));

    /** Pixels either side of the viewport an event bar is still mounted for. */
    readonly timelineVirtualEventBuffer = computed(() => Math.max(this.inputs.timelineVirtualEventBuffer(), 0));

    /** Shortest slice an event may occupy, so a one-minute appointment stays readable. */
    readonly minEventMinutes = computed(() => this.inputs.minEventMinutes());

    /**
     * Wall-clock hours the time grid renders, as `[start, end)`. `end` accepts 24 for a whole day.
     * Clamped and ordered here so a bad input cannot produce a negative span downstream.
     */
    readonly dayBounds = computed(() => {
        const start = Math.min(Math.max(this.inputs.dayStartHour(), 0), 23);
        const end = Math.min(Math.max(this.inputs.dayEndHour(), start + 1), 24);
        return { start, end };
    });

    /** The resources, as bound. */
    readonly resources = computed(() => this.inputs.resources());

    /** The categories, as bound. */
    readonly categories = computed(() => this.inputs.categories());

    /** The visible range of the active view. */
    readonly range = computed<SchedulerRange>(() =>
        viewRange(this.inputs.view(), this.inputs.date(), {
            firstDayOfWeek: this.inputs.firstDayOfWeek(),
            dayCount: this.inputs.dayCount(),
            agendaDays: this.inputs.agendaDays()
        })
    );

    /** Ids of the categories currently filtered OUT. Empty means everything is shown. */
    readonly hiddenCategories = signal<ReadonlySet<string | number>>(new Set());

    /** Whether a category filter is active. */
    readonly filtering = computed(() => this.hiddenCategories().size > 0);

    /** Ids of the selected events. */
    readonly selectedEventIds = signal<ReadonlySet<string | number>>(new Set());

    /** Id of the event holding keyboard focus. */
    readonly focusedEventId = signal<string | number | null>(null);

    /** Id of the event being dragged, when a drag is in progress. */
    readonly draggingEventId = signal<string | number | null>(null);

    /** Id of the event being resized. */
    readonly resizingEventId = signal<string | number | null>(null);

    /**
     * The event a pointer interaction is currently on, whichever kind.
     *
     * The renderers take it out of the overlap layout: a bar that renarrows and changes row as it
     * collides with whatever it passes over is what makes a drag feel broken, so the one being
     * dragged floats at full size and everything else stays exactly where it was.
     */
    readonly interactingEventId = computed(() => this.draggingEventId() ?? this.resizingEventId());

    /** Days currently selected by a date selection, as `YYYY-MM-DD` keys. */
    readonly selectedDates = computed<readonly string[]>(() => this.inputs.selectedDates().map((date) => dayKey(date)));

    /** Anchor of a range selection: the first click, waiting for the second. */
    private readonly rangeAnchor = signal<Date | null>(null);

    /**
     * The blocked windows, with their instants resolved once.
     */
    private readonly blocked = computed(() =>
        this.inputs.blockedIntervals().map((interval) => ({
            start: toDate(interval.start).getTime(),
            end: toDate(interval.end).getTime(),
            resourceId: interval.resourceId
        }))
    );

    /**
     * Whether an instant falls in a blocked window.
     *
     * An interval without a `resourceId` blocks every resource, which is the common case: a closure
     * is a closure for everyone.
     */
    isBlocked(date: Date, resourceId?: string | number): boolean {
        const time = date.getTime();
        return this.blocked().some((interval) => time >= interval.start && time < interval.end && (interval.resourceId == null || interval.resourceId === resourceId));
    }

    /** Whether a range overlaps a blocked window, which is what refuses a drop. */
    overlapsBlocked(start: Date, end: Date, resourceId?: string | number): boolean {
        const from = start.getTime();
        const to = end.getTime();
        return this.blocked().some((interval) => from < interval.end && to > interval.start && (interval.resourceId == null || interval.resourceId === resourceId));
    }

    /**
     * Applies a click on a date to the selection.
     *
     * `range` needs two clicks: the first sets the anchor, the second fills in every day between —
     * and a third starts over, because a range selection with no way back is a trap.
     */
    selectDate(date: Date): void {
        const mode = this.inputs.dateSelection();
        if (mode === 'none') return;

        const day = startOfDay(date);
        const current = this.inputs.selectedDates();

        if (mode === 'single') {
            this.inputs.setSelectedDates(this.isDateSelected(day) && current.length === 1 ? [] : [day]);
            return;
        }

        if (mode === 'multiple') {
            this.inputs.setSelectedDates(this.isDateSelected(day) ? current.filter((selected) => dayKey(selected) !== dayKey(day)) : [...current, day]);
            return;
        }

        const anchor = this.rangeAnchor();
        if (!anchor) {
            this.rangeAnchor.set(day);
            this.inputs.setSelectedDates([day]);
            return;
        }

        const [from, to] = anchor <= day ? [anchor, day] : [day, anchor];
        const range: Date[] = [];
        for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) range.push(cursor);
        this.rangeAnchor.set(null);
        this.inputs.setSelectedDates(range);
    }

    /** What each overlay is anchored to; `null` means closed. */
    readonly morePopover = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly quickInfo = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly eventPopover = signal<SchedulerOverlayTarget | null>(null);
    /** @see morePopover */
    readonly contextMenu = signal<SchedulerOverlayTarget | null>(null);

    /**
     * Window the recurring series are expanded over.
     *
     * The visible range plus six weeks either side, and not the range itself: the month grid draws
     * the neighbouring weeks, the agenda groups by day, and an occurrence that STARTED before the
     * range can still be running inside it. Six weeks covers the widest of those overhangs without
     * turning an open-ended weekly series into thousands of copies.
     */
    private readonly expansionWindow = computed<SchedulerRange>(() => {
        const { start, end } = this.range();
        return { start: addDays(start, -42), end: addDays(end, 42) };
    });

    /**
     * The bound events with every recurring series expanded into its occurrences.
     *
     * Everything downstream reads THIS and not the input, so no view has to know that recurrence
     * exists. A collection with no `rrule` in it comes back untouched, by identity.
     */
    private readonly seriesEvents = computed(() => expandEvents(this.inputs.events(), this.expansionWindow(), this.inputs.defaultEventDuration()));

    readonly expandedEvents = computed(() => {
        // Dos capas y no una: la expansión de series depende SOLO de los datos y de la ventana, así
        // que un preview de arrastre —que cambia sesenta veces por segundo— no vuelve a parsear una
        // RRULE ni a regenerar ocurrencias. Los cambios se aplican después de expandir porque el id
        // de una ocurrencia solo existe una vez expandida: arrastrar una cita de una serie mueve esa
        // ocurrencia, no la serie.
        const preview = this.dragPreview();
        const pending = preview ? new Map([...this.pendingChanges(), [preview.id, preview.change]]) : this.pendingChanges();
        return applyPendingChanges(this.seriesEvents(), pending);
    });

    /**
     * Moves and resizes the Scheduler is holding on top of the bound data, keyed by event id.
     *
     * The Scheduler does not own the events, so a finished drag cannot write into them; it keeps the
     * change here and stops applying it as soon as the application persists it or calls `revert()`.
     * That is what makes an interaction feel immediate in a controlled component.
     */
    readonly pendingChanges = signal<ReadonlyMap<string | number, SchedulerPendingChange>>(new Map());

    /** The live proposal of the interaction in progress. */
    readonly dragPreview = signal<{ id: string | number; change: SchedulerPendingChange } | null>(null);

    /**
     * Events that survive the category filter, with their instants resolved.
     *
     * Deliberately NOT clipped to the range: the month grid shows the neighbouring weeks and the
     * agenda groups by day, so each renderer clips to what it draws.
     */
    readonly filteredEvents = computed(() => {
        const hidden = this.hiddenCategories();
        const field = this.inputs.categoryField();
        const events = this.expandedEvents();
        if (!hidden.size || !field) return events;
        return events.filter((event) => !hidden.has(event[field]));
    });

    /** Events overlapping the visible range. */
    readonly visibleEvents = computed(() => {
        const { start, end } = this.range();
        const duration = this.inputs.defaultEventDuration();
        return this.filteredEvents().filter((event) => {
            const from = toDate(event.start);
            const rawTo = event.end != null ? toDate(event.end) : null;
            const to = rawTo && rawTo > from ? rawTo : new Date(from.getTime() + duration * 60_000);
            return from < end && to > start;
        });
    });

    /**
     * The selected events, in the order they were bound.
     *
     * Read from the EXPANDED collection: the ids of a recurring occurrence exist only there, so
     * looking them up in the input would return nothing for a selected occurrence.
     */
    readonly selectedEvents = computed(() => {
        const ids = this.selectedEventIds();
        return ids.size ? this.expandedEvents().filter((event) => ids.has(event.id)) : [];
    });

    /** Categories with the count of visible events each, and whether the category is shown. */
    readonly categoryCounts = computed(() => {
        const field = this.inputs.categoryField();
        const hidden = this.hiddenCategories();
        const counts = new Map<unknown, number>();
        for (const event of this.visibleEvents()) {
            const key = field ? event[field] : undefined;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return this.inputs.categories().map((category) => ({
            ...category,
            count: counts.get(category.id) ?? 0,
            active: !hidden.has(category.id)
        }));
    });

    /** Resources indexed by id, for the event → resource lookup. */
    readonly resourceMap = computed(() => new Map(this.inputs.resources().map((resource) => [resource.id, resource])));

    /** Categories indexed by id. */
    readonly categoryMap = computed(() => new Map(this.inputs.categories().map((category) => [category.id, category])));

    /**
     * Title of an event, from `titleField`, falling back to `title` and then to the id so a card is
     * never blank.
     */
    title(event: SchedulerEvent): string {
        const field = this.inputs.titleField();
        return String(event[field] ?? event.title ?? event.id);
    }

    /**
     * Category of an event, resolved through `categoryField`.
     */
    category(event: SchedulerEvent): SchedulerCategory | undefined {
        const field = this.inputs.categoryField();
        return field ? this.categoryMap().get(event[field]) : undefined;
    }

    /**
     * Resource of an event.
     */
    resource(event: SchedulerEvent): SchedulerResource | undefined {
        return event.resourceId != null ? this.resourceMap().get(event.resourceId) : undefined;
    }

    /**
     * Accent colour of an event: its category's, else its resource's, else none. The category wins
     * because it is the classification the legend explains.
     */
    accentColor(event: SchedulerEvent): string | undefined {
        return this.category(event)?.color ?? this.resource(event)?.color;
    }

    /** Whether an event is selected. */
    isSelected(event: SchedulerEvent): boolean {
        return this.selectedEventIds().has(event.id);
    }

    /** Whether a day is part of the date selection. */
    isDateSelected(date: Date): boolean {
        return this.selectedDates().includes(dayKey(date));
    }

    /** Whether a day is a working day. */
    isWorkDay(date: Date): boolean {
        return this.workDays().includes(date.getDay());
    }

    /** Moves the anchor date by one range in either direction. */
    move(direction: -1 | 1): void {
        this.inputs.setDate(
            navigate(this.inputs.view(), this.inputs.date(), direction, {
                dayCount: this.inputs.dayCount(),
                agendaDays: this.inputs.agendaDays()
            })
        );
    }

    /**
     * Jumps to a date in the day view. The year view is a navigator, so its cells lead here.
     */
    goToDay(date: Date): void {
        this.inputs.setDate(startOfDay(date));
        this.inputs.setView('day');
    }

    /** Moves the anchor date to today. */
    goToToday(): void {
        this.inputs.setDate(startOfDay(new Date()));
    }

    /** Switches view, keeping the anchor date. */
    changeView(view: SchedulerViewType): void {
        this.inputs.setView(view);
    }

    /** Toggles a category filter. */
    toggleCategory(id: string | number): void {
        const next = new Set(this.hiddenCategories());
        next.has(id) ? next.delete(id) : next.add(id);
        this.hiddenCategories.set(next);
    }

    /** Clears every category filter. */
    clearCategoryFilter(): void {
        this.hiddenCategories.set(new Set());
    }

    /**
     * Applies a click to the selection.
     *
     * `single` replaces the selection, `multiple` toggles the clicked event, and `none` selects
     * nothing at all — a Scheduler used purely as a read-only display should not accumulate state.
     */
    selectEvent(event: SchedulerEvent, mode: 'none' | 'single' | 'multiple', additive: boolean, max: number): boolean {
        if (mode === 'none') return true;

        const current = this.selectedEventIds();
        if (mode === 'single' || !additive) {
            this.selectedEventIds.set(current.has(event.id) && current.size === 1 ? new Set() : new Set([event.id]));
            return true;
        }

        const next = new Set(current);
        if (next.has(event.id)) {
            next.delete(event.id);
        } else {
            // El tope se comprueba ANTES de añadir y se avisa al llamante: el root emite
            // eventSelectionLimitReached en vez de tragarse el clic en silencio.
            if (Number.isFinite(max) && next.size >= max) return false;
            next.add(event.id);
        }
        this.selectedEventIds.set(next);
        return true;
    }

    /** Clears the event selection. */
    clearSelection(): void {
        this.selectedEventIds.set(new Set());
    }

    /** Closes every overlay. */
    closeOverlays(): void {
        this.morePopover.set(null);
        this.quickInfo.set(null);
        this.eventPopover.set(null);
        this.contextMenu.set(null);
    }

    /** Localised name of a view. */
    viewLabel(view: SchedulerViewType): string {
        return this.labels().views[view] ?? view;
    }

    /** Asks the application to delete the selected events. */
    requestBulkDelete(): void {
        this.inputs.bulkDelete(this.selectedEvents());
    }

    /**
     * A click on an event surface: updates the selection, opens the quick info if it is enabled, and
     * emits `eventClick` either way.
     *
     * The order matters. The selection is applied first so an application listening to
     * `eventClick` already sees the new selection, and a rejected click (the selection cap) emits
     * `eventSelectionLimitReached` instead of silently doing nothing.
     */
    handleEventClick(originalEvent: MouseEvent, event: SchedulerEvent): void {
        // El clic que cierra un arrastre no es un clic: sin esto, mover una cita la seleccionaría y
        // abriría su quick info al soltar.
        if (this.drag.consumeClickSuppression()) return;

        const mode = this.inputs.selectionMode();
        const max = this.inputs.maxSelection();
        const additive = originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.shiftKey;

        const accepted = this.selectEvent(event, mode, additive, max);
        if (!accepted) {
            this.inputs.emitSelectionLimit(max);
        } else if (mode !== 'none') {
            this.inputs.emitSelectionChange(this.selectedEvents());
        }

        if (this.inputs.quickInfoEnabled()) {
            this.quickInfo.set({ event, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
        }

        this.inputs.emitEventClick(originalEvent, event);
    }

    /**
     * Hover or focus on an event surface: opens the event popover when the root enabled it.
     *
     * Focus counts as well as hover on purpose — an overlay only a mouse can reach is an overlay a
     * keyboard user cannot read.
     */
    handleEventPeek(originalEvent: Event, event: SchedulerEvent): void {
        if (!this.inputs.eventPopoverEnabled()) return;
        this.eventPopover.set({ event, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
    }

    /** The pointer or the focus left the event surface. */
    handleEventPeekEnd(): void {
        if (this.eventPopover()) this.eventPopover.set(null);
    }

    /**
     * A right click on an event or a cell: opens the context menu when the root enabled it.
     *
     * The browser menu is only suppressed when the Scheduler actually has one to show, so a page
     * that did not ask for it keeps the native menu instead of losing it to a no-op.
     */
    handleContextMenu(originalEvent: MouseEvent, target: SchedulerOverlayTarget): void {
        if (!this.inputs.contextMenuEnabled()) return;
        originalEvent.preventDefault();
        this.contextMenu.set({ ...target, anchor: (originalEvent.currentTarget as HTMLElement) ?? undefined });
    }

    /**
     * A click on an empty slot, which is how a new appointment starts.
     *
     * The date selection is applied BEFORE the output fires, so an application listening to
     * `dateClick` already sees the selection the click produced.
     */
    handleSlotClick(originalEvent: MouseEvent, start: Date, end: Date): void {
        this.selectDate(start);
        this.inputs.emitSlotClick(originalEvent, start, end);
    }

    /** Asks the application to edit an event. The Scheduler never mutates it itself. */
    requestEdit(event?: SchedulerEvent): void {
        if (event) this.inputs.eventChange(event);
    }

    /** Asks the application to delete an event. */
    requestRemove(event?: SchedulerEvent): void {
        if (event) this.inputs.eventRemove(event);
    }

    /** Localised time range of an event, for the overlays. */
    eventTimeText(event: SchedulerEvent): string {
        if (event.allDay) return this.labels().allDay;
        const start = toDate(event.start);
        const end = event.end != null ? toDate(event.end) : new Date(start.getTime() + this.defaultEventDuration() * 60_000);
        return formatTimeRange(start, end, this.locale());
    }

    /** Opens the overflow popover for a cell. */
    openMorePopover(date: Date, events: SchedulerEvent[], anchor?: HTMLElement): void {
        this.morePopover.set({ date, events, anchor });
    }

    /**
     * Whether an event may be moved.
     *
     * The event's own `editable` wins over the root's, so a schedule can be editable with a handful
     * of frozen appointments in it without the page having to split the collection.
     */
    isStartEditable(event: SchedulerEvent): boolean {
        return (event.editable ?? this.inputs.editable()) && this.inputs.eventStartEditable();
    }

    /** Whether an event may be resized. */
    isDurationEditable(event: SchedulerEvent): boolean {
        // Un evento de todo el día no se redimensiona en la rejilla: no tiene eje de tiempo al que
        // agarrarse, así que cambiar su rango es un formulario, no un arrastre.
        if (event.allDay) return false;
        return (event.editable ?? this.inputs.editable()) && this.inputs.eventDurationEditable();
    }

    /** Drives the pointer interactions. Views hand it their pointerdown and it does the rest. */
    readonly drag = new SchedulerDragController({
        view: () => this.inputs.view(),
        startEditable: (event) => this.isStartEditable(event),
        durationEditable: (event) => this.isDurationEditable(event),
        // El timeline puede pedir su propio redondeo: una columna de una hora en horizontal no quiere
        // el mismo salto que una fila de media hora en vertical.
        snapMinutes: (target: SchedulerDragTarget) => (target.whole ? 24 * 60 : (this.inputs.timelineSnapDuration() ?? this.inputs.snapDuration())),
        minEventMinutes: () => this.inputs.minEventMinutes(),
        defaultEventDuration: () => this.inputs.defaultEventDuration(),
        minDistance: () => this.inputs.dragMinDistance(),
        // Un hueco bloqueado se rechaza ANTES de preguntar a la aplicación: si la página ya declaró
        // que ahí no se puede, no tiene que volver a decirlo en el callback.
        allow: (info) => !this.overlapsBlocked(info.start, info.end, info.resourceId) && (this.inputs.eventAllow()?.(info) ?? true),
        preview: (id, change, kind) => {
            if (id == null || !change) {
                this.dragPreview.set(null);
                this.draggingEventId.set(null);
                this.resizingEventId.set(null);
                return;
            }
            // El punto de partida lo trae el controlador, que ya lo capturó al empezar: buscarlo aquí
            // por id era un recorrido de toda la colección en cada frame del arrastre.
            this.dragPreview.set({ id, change });
            (kind === 'move' ? this.draggingEventId : this.resizingEventId).set(id);
        },
        commit: (id, change) => {
            const next = new Map(this.pendingChanges());
            next.set(id, change);
            this.pendingChanges.set(next);
        },
        rollback: (id) => {
            const next = new Map(this.pendingChanges());
            next.delete(id);
            this.pendingChanges.set(next);
        },
        emitDragStart: (payload) => this.inputs.emitDragStart(payload),
        emitDrop: (payload) => this.inputs.emitDrop(payload),
        emitResizeStart: (payload) => this.inputs.emitResizeStart(payload),
        emitResize: (payload) => this.inputs.emitResize(payload),
        emitResizeStop: (payload) => this.inputs.emitResizeStop(payload)
    });

    /**
     * Human title of the visible range.
     *
     * The end of the range is nudged back by a millisecond before formatting: a half-open range
     * ending at midnight on the 1st would otherwise print the next month's name in the header.
     */
    readonly rangeTitle = computed(() => {
        const locale = this.inputs.locale();
        const { start, end } = this.range();
        const last = new Date(end.getTime() - 1);
        const view = this.inputs.view();

        const timelineScale = timelineScaleOf(view);
        if (view === 'year' || timelineScale === 'year') {
            return String(start.getFullYear());
        }
        // El mes y la agenda se titulan con el mes de la fecha ancla y NO con el rango: el del mes
        // abarca semanas enteras y se sale por los dos lados —un mes que empieza en domingo se
        // titularía con el anterior—, y el de la agenda son N días a partir del ancla, que impreso
        // como rango da un "8 sep - 7 oct" que no dice dónde estás.
        if (view === 'month' || view === 'resourceMonth' || view === 'dateMonth' || view === 'agenda' || timelineScale === 'month') {
            return this.inputs.date().toLocaleDateString(locale, { month: 'long', year: 'numeric' });
        }
        if (dayKey(start) === dayKey(last)) {
            return start.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        }
        if (start.getFullYear() !== last.getFullYear()) {
            return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        if (start.getMonth() !== last.getMonth()) {
            return `${start.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;
        }
        // Sin año dentro del mismo mes: en una semana el año es ruido, y el mes ya sale una vez.
        return `${start.getDate()} - ${last.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}`;
    });
}
