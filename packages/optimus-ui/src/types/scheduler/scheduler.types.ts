import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The view modes the Scheduler can render.
 *
 * The `timeline*` views lay time out horizontally over a day, a week, a month or a year; the
 * `resourceTimeline*` ones do the same with one lane per resource. The `resource*` views group rows
 * by resource, the `date*` views group columns by date and subdivide each one by resource.
 * Everything else is a plain calendar view.
 *
 * `timeline` and `resourceTimeline` are the day-scale timelines under their original names, kept as
 * aliases of `timelineDay` and `resourceTimelineDay`.
 *
 * @group Types
 */
export type SchedulerViewType =
    | 'day'
    | 'week'
    | 'month'
    | 'year'
    | 'agenda'
    | 'timeline'
    | 'timelineDay'
    | 'timelineWeek'
    | 'timelineMonth'
    | 'timelineYear'
    | 'resourceDay'
    | 'resourceWeek'
    | 'resourceMonth'
    | 'resourceTimeline'
    | 'resourceTimelineDay'
    | 'resourceTimelineWeek'
    | 'resourceTimelineMonth'
    | 'resourceTimelineYear'
    | 'dateDay'
    | 'dateWeek'
    | 'dateMonth';

/**
 * How far a timeline view spans. Derived from the view name by {@link timelineScaleOf}.
 *
 * @group Types
 */
export type SchedulerTimelineScale = 'day' | 'week' | 'month' | 'year';

/**
 * An appointment. `start`/`end` accept a `Date` or anything `new Date()` parses, so a payload
 * straight off a JSON API works without mapping.
 *
 * @group Interface
 */
export interface SchedulerEvent {
    /**
     * Unique identifier. Required: it is the tracking key of every list and the identity used by
     * selection, editing and the overlays.
     */
    id: string | number;
    /**
     * Text shown on the event.
     */
    title?: string;
    /**
     * Start of the appointment.
     */
    start: Date | string | number;
    /**
     * End of the appointment. When omitted the event lasts `defaultEventDuration` minutes.
     */
    end?: Date | string | number;
    /**
     * Whether the event spans whole days and is rendered in the all-day row instead of the time grid.
     */
    allDay?: boolean;
    /**
     * Identifier of the resource this event belongs to. Drives the `resource*` and `date*` views.
     */
    resourceId?: string | number;
    /**
     * Free-form description shown by the quick info and popover.
     */
    description?: string;
    /**
     * Where the appointment takes place.
     */
    location?: string;
    /**
     * Whether the event can be moved or resized.
     */
    editable?: boolean;
    /**
     * Any extra payload. Reachable from every template through the event itself.
     */
    [key: string]: any;
}

/**
 * A row (or column) the events are grouped into: a room, a machine, a person.
 *
 * @group Interface
 */
export interface SchedulerResource {
    /**
     * Unique identifier, matched against `SchedulerEvent.resourceId`.
     */
    id: string | number;
    /**
     * Text shown in the resource header.
     */
    name?: string;
    /**
     * Identifier of the parent resource. Set it to render collapsible groups in the resource timeline.
     */
    parentId?: string | number | null;
    /**
     * Colour used for the resource accent. Any CSS colour.
     */
    color?: string;
    /**
     * Any extra payload.
     */
    [key: string]: any;
}

/**
 * A colour-coded classification, matched against the event field named by `categoryField`.
 *
 * @group Interface
 */
export interface SchedulerCategory {
    /**
     * Value that the event's `categoryField` must equal.
     */
    id: string | number;
    /**
     * Text shown in the legend.
     */
    name?: string;
    /**
     * Colour of the events in this category. Any CSS colour.
     */
    color?: string;
}

/**
 * An event positioned by the layout engine, ready to paint. Coordinates are fractions of the
 * container (0..1) so the same result works for a vertical time grid and a horizontal timeline.
 *
 * @group Interface
 */
export interface SchedulerLayoutItem<T = SchedulerEvent> {
    /**
     * The event being positioned.
     */
    event: T;
    /**
     * Offset along the time axis, as a fraction of the visible range.
     */
    offset: number;
    /**
     * Length along the time axis, as a fraction of the visible range.
     */
    size: number;
    /**
     * Index of the overlap column this event was placed in.
     */
    column: number;
    /**
     * How many overlap columns the group it belongs to needs.
     */
    columns: number;
    /**
     * Row the event was packed into. Used by the all-day row, month cells and timelines.
     */
    row: number;
    /**
     * Whether the event starts before the visible range.
     */
    continuesBefore: boolean;
    /**
     * Whether the event ends after the visible range.
     */
    continuesAfter: boolean;
}

/**
 * Emitted when the visible range changes, whichever the cause: navigation, a view switch or a
 * programmatic change of `date`.
 *
 * @group Interface
 */
export interface SchedulerRangeChangeEvent {
    /**
     * First instant included in the view.
     */
    start: Date;
    /**
     * First instant *after* the view. The range is half-open: `[start, end)`.
     */
    end: Date;
    /**
     * The view that produced the range.
     */
    view: SchedulerViewType;
}

/**
 * Emitted when an event is clicked.
 *
 * @group Interface
 */
export interface SchedulerEventClickEvent {
    /**
     * Browser event that triggered it.
     */
    originalEvent: Event;
    /**
     * The appointment that was clicked.
     */
    event: SchedulerEvent;
}

/**
 * A window nothing can be scheduled in: a maintenance slot, a closure, a resource that is out.
 *
 * Cells inside it are marked `data-blocked`, and a move or resize that would land in it is refused
 * before `eventAllow` is even asked.
 *
 * @group Interface
 */
export interface SchedulerBlockedInterval {
    /**
     * First instant blocked.
     */
    start: Date | string | number;
    /**
     * First instant free again. The interval is half-open, `[start, end)`.
     */
    end: Date | string | number;
    /**
     * Resource the block applies to. Left out, it blocks every resource.
     */
    resourceId?: string | number;
    /**
     * Why it is blocked, for your own templates to show.
     */
    reason?: string;
}

/**
 * How clicking a date builds a selection.
 *
 * @group Types
 */
export type SchedulerDateSelectionMode = 'none' | 'single' | 'multiple' | 'range';

/**
 * Which edge of an event a resize is pulling.
 *
 * @group Types
 */
export type SchedulerResizeEdge = 'start' | 'end';

/**
 * A proposed move or resize, handed to `eventAllow` before the Scheduler offers the target.
 *
 * @group Interface
 */
export interface SchedulerDropInfo {
    /**
     * The event being moved or resized.
     */
    event: SchedulerEvent;
    /**
     * Proposed start.
     */
    start: Date;
    /**
     * Proposed end.
     */
    end: Date;
    /**
     * Whether the proposal lands on an all-day surface.
     */
    allDay: boolean;
    /**
     * Proposed resource, when the drag crossed lanes.
     */
    resourceId?: string | number;
    /**
     * The view the interaction is happening in.
     */
    view: SchedulerViewType;
}

/**
 * Emitted by every drag and resize output.
 *
 * @group Interface
 */
export interface SchedulerDragPayload {
    /**
     * Pointer event that produced it.
     */
    originalEvent: PointerEvent;
    /**
     * The event, as it is bound. For a recurring series this is the OCCURRENCE, so `recurrenceId`
     * and `recurrenceStart` are what identify it inside the series.
     */
    event: SchedulerEvent;
    /**
     * Accepted start.
     */
    start: Date;
    /**
     * Accepted end.
     */
    end: Date;
    /**
     * Whether it ended on an all-day surface.
     */
    allDay: boolean;
    /**
     * Resource it ended in, when the view has lanes.
     */
    resourceId?: string | number;
    /**
     * Which edge a resize was pulling. Absent for a move.
     */
    edge?: SchedulerResizeEdge;
    /**
     * Drops the change the Scheduler is holding, putting the event back where it was. Call it when
     * the change cannot be persisted.
     */
    revert: () => void;
}

/**
 * Emitted when an empty slot is clicked, which is how a new appointment starts.
 *
 * @group Interface
 */
export interface SchedulerSlotClickEvent {
    /**
     * Browser event that triggered it.
     */
    originalEvent: Event;
    /**
     * Start of the clicked slot.
     */
    start: Date;
    /**
     * End of the clicked slot.
     */
    end: Date;
    /**
     * Resource of the clicked slot, when the view has one.
     */
    resource?: SchedulerResource;
}

/**
 * Defines valid pass-through options in Scheduler component.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in Scheduler component.
 * @see {@link SchedulerPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerPassThrough<I = unknown> = PassThrough<I, SchedulerPassThroughOptions<I>>;

/**
 * Defines valid pass-through options in SchedulerHeader component.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerHeaderPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in SchedulerHeader component.
 * @see {@link SchedulerHeaderPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerHeaderPassThrough<I = unknown> = PassThrough<I, SchedulerHeaderPassThroughOptions<I>>;

/**
 * Defines valid pass-through options in the Scheduler view components.
 * @template I Type of instance.
 *
 * @group Interface
 */
export interface SchedulerViewPassThroughOptions<I = unknown> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the header's DOM element.
     */
    header?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to the body's DOM element.
     */
    body?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to a cell's DOM element.
     */
    cell?: PassThroughOption<HTMLElement, I>;
    /**
     * Used to pass attributes to an event's DOM element.
     */
    event?: PassThroughOption<HTMLElement, I>;
}

/**
 * Defines valid pass-through options in the Scheduler view components.
 * @see {@link SchedulerViewPassThroughOptions}
 *
 * @template I Type of instance.
 */
export type SchedulerViewPassThrough<I = unknown> = PassThrough<I, SchedulerViewPassThroughOptions<I>>;
