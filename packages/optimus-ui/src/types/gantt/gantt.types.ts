import type { TemplateRef } from '@angular/core';
import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Which field of a data item feeds which part of a task. Mirrors Syncfusion's `taskFields`.
 * @group Types
 */
export interface GanttTaskFields {
    /** Unique id of the task. Required for dependencies and for a flat `parentID` hierarchy. */
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    /** Length in working days. A task of zero is a milestone. */
    duration?: string;
    /** Progress from 0 to 100. */
    progress?: string;
    /** The predecessors, for example `2FS+1d, 3SS`: the id, the type (`FS`, `SS`, `FF`, `SF`) and an offset in days. */
    dependency?: string;
    /** The id of the parent, for a flat list. */
    parentID?: string;
    /** The children, for a nested list. */
    child?: string;
    notes?: string;
    /** Planned first day, from `baselineStartDate`. */
    baselineStartDate?: string;
    /** Planned last day, from `baselineEndDate`. */
    baselineEndDate?: string;
    /** Names the people or things assigned, from `resourceInfo`. */
    resourceInfo?: string;
}

/**
 * The kind of a dependency: which end of the predecessor drives which end of the successor.
 * @group Types
 */
export type GanttDependencyType = 'FS' | 'SS' | 'FF' | 'SF';

/**
 * One predecessor of a task.
 * @group Types
 */
export interface GanttDependency {
    /** The id of the predecessor. */
    id: string;
    type: GanttDependencyType;
    /** The gap between the two ends, in `offsetUnit`; negative is a lead. */
    offset: number;
    /** The unit of the gap: days when left out. */
    offsetUnit?: 'd' | 'h' | 'm';
}

/**
 * A task as the Gantt works with it, after the dates have been scheduled.
 * @group Types
 */
export interface GanttTask {
    id: string;
    /** Position in the preorder of the whole tree. */
    index: number;
    /** 0 for a top-level task. */
    level: number;
    parentId: string | null;
    childIds: string[];
    name: string;
    /** First day, as a date. */
    startDate: Date;
    /** Last day, as a date, included. */
    endDate: Date;
    /** Length in working days. */
    duration: number;
    progress: number;
    dependencies: GanttDependency[];
    /** `true` when it has children: its dates come from them. */
    isParent: boolean;
    /** `true` for a task of zero duration. */
    isMilestone: boolean;
    /** `true` when a delay of this task delays the end of the project. */
    isCritical: boolean;
    expanded: boolean;
    notes?: string;
    /** Planned first day, when the data has one. */
    baselineStartDate: Date | null;
    /** Planned last day, when the data has one. */
    baselineEndDate: Date | null;
    /** Working days the task ends after (positive) or before (negative) its plan. `null` without a baseline. */
    variance: number | null;
    /** What is assigned to it. */
    resources: GanttResource[];
    /** `true` when a resource of it is assigned to another task at the same time. */
    isOverallocated: boolean;
    /** The data item it was made from. */
    data: any;
}

/**
 * A person or thing tasks are assigned to.
 * @group Types
 */
export interface GanttResource {
    id: string | number;
    name: string;
    /** Share of the resource one task takes, in percent. Default 100. */
    unit?: number;
}

/**
 * A column of the grid.
 * @group Types
 */
export interface GanttColumn {
    /** A task field: `id`, `name`, `startDate`, `endDate`, `duration`, `progress` or `dependency`; or a field of the data item. */
    field: string;
    headerText?: string;
    /** Width in pixels. */
    width?: number;
    textAlign?: 'left' | 'center' | 'right';
    /** A date pattern for dates, for example `yyyy-MM-dd`. */
    format?: string;
    /** Custom cell. Context: `$implicit` (the task), `value`. */
    template?: TemplateRef<any>;
}

/**
 * One tier of the timeline header.
 * @group Types
 */
export interface GanttTier {
    unit?: 'year' | 'month' | 'week' | 'day';
    /** An `Intl.DateTimeFormat` description, or a pattern with `yyyy`, `MMM`, `MMMM`, `dd`, `d`, `EEE`. */
    format?: string | Intl.DateTimeFormatOptions;
}

/**
 * The timeline header and zoom. Mirrors Syncfusion's `timelineSettings`.
 * @group Types
 */
export interface GanttTimelineSettings {
    topTier?: GanttTier;
    bottomTier?: GanttTier;
    /** Width in pixels of one unit of the bottom tier. Sets the zoom. */
    timelineUnitSize?: number;
    showTooltip?: boolean;
}

/**
 * The split between the grid and the chart.
 * @group Types
 */
export interface GanttSplitterSettings {
    /** Width of the grid: pixels, or a percentage like `'40%'`. */
    position?: string | number;
    minimum?: string | number;
    maximum?: string | number;
}

/**
 * What the user may change. Mirrors Syncfusion's `editSettings`.
 * @group Types
 */
export interface GanttEditSettings {
    /** Moves and resizes the bars and drags their progress. */
    allowTaskbarEditing?: boolean;
    allowAdding?: boolean;
    allowDeleting?: boolean;
    /** Lets the user edit cells (double click, or F2), and the keyboard indent and outdent a task. */
    allowEditing?: boolean;
    /** `cell` edits in the grid; `dialog` opens a form for the whole task. */
    mode?: 'cell' | 'dialog';
}

/**
 * Names of the fields shown beside a bar. Mirrors Syncfusion's `labelSettings`.
 * @group Types
 */
export interface GanttLabelSettings {
    /** A field of the task, or a function, for the text left of the bar. */
    leftLabel?: string | ((task: GanttTask) => string);
    rightLabel?: string | ((task: GanttTask) => string);
    /** The text inside the bar. */
    taskLabel?: string | ((task: GanttTask) => string);
}

/**
 * A stretch of days with no work.
 * @group Types
 */
export interface GanttHoliday {
    from: Date | string;
    to?: Date | string;
    label?: string;
}

/**
 * A date to mark on the chart.
 * @group Types
 */
export interface GanttEventMarker {
    day: Date | string;
    label?: string;
}

/**
 * Event of `taskbarEditing` and `taskbarEdited`.
 * @group Events
 */
export interface GanttTaskbarEvent {
    /** The task as it is now, with its new dates. */
    task: GanttTask;
    /** What the user is doing to the bar. */
    action: 'move' | 'resizeStart' | 'resizeEnd' | 'progress';
    /** The data item before the change. */
    previousData: any;
    /** Set to `true` on `taskbarEditing` to cancel the edit. */
    cancel: boolean;
}

/**
 * Event of `actionBegin` and `actionComplete`.
 * @group Events
 */
export interface GanttActionEvent {
    requestType: 'add' | 'delete' | 'indent' | 'outdent' | 'save' | 'taskbarEdit' | 'expand' | 'collapse';
    data?: any;
    /** On `actionBegin`: set to `true` to stop the action. */
    cancel: boolean;
}

/**
 * Event of the expand and collapse events.
 * @group Events
 */
export interface GanttExpandEvent {
    task: GanttTask;
    /** On `expanding` and `collapsing`: set to `true` to stop it. */
    cancel: boolean;
}

/**
 * Event of `cellEdit`. Change `value`, or set `cancel` to stop it.
 * @group Events
 */
export interface GanttCellEditEvent {
    task: GanttTask;
    /** The column field. */
    field: string;
    /** What the user typed, read into the type of the field. */
    value: any;
    cancel: boolean;
}

/**
 * Event of `rowSelected`.
 * @group Events
 */
export interface GanttSelectEvent {
    task: GanttTask;
    rowIndex: number;
}

/**
 * Event of `invalid`: a problem found in the data.
 * @group Events
 */
export interface GanttInvalidEvent {
    kind: 'cycle' | 'missingPredecessor' | 'duplicateId';
    ids: string[];
    message: string;
}

/**
 * The text the Gantt draws and announces. Every entry can be replaced through the `messages` input. `{name}`, `{unit}`, `{value}`, `{start}`, `{end}`,
 * `{column}` and `{count}` are replaced where an entry lists them.
 * @group Types
 */
export interface GanttMessages {
    /** Name of the task grid for assistive technology. */
    tasks: string;
    /** Name of a task that has none, in the dialog title. */
    task: string;
    /** Label of the button of a collapsed parent, followed by the name. `{name}` is replaced. */
    expand: string;
    /** Label of the button of an open parent. `{name}` is replaced. */
    collapse: string;
    /** Name of the splitter. */
    resizeTaskList: string;
    /** What a row sounds like: `{start}`, `{end}` and `{value}` (the progress) are replaced. */
    rowSummary: string;
    milestone: string;
    critical: string;
    overAllocated: string;
    /** Added to the tooltip of a bar that differs from its plan: `{value}` and `{unit}` are replaced. */
    varianceVsPlan: string;
    /** Announced after a cell was edited: `{name}` and `{column}` are replaced. */
    cellChanged: string;
    /** Announced after a bar's progress changed: `{name}` and `{value}` are replaced. */
    progressChanged: string;
    /** Announced after a bar moved or resized: `{name}`, `{start}` and `{end}` are replaced. */
    taskRescheduled: string;
    name: string;
    start: string;
    /** Label of the duration field of the dialog. `{unit}` is replaced. */
    duration: string;
    progress: string;
    predecessors: string;
    resources: string;
    notes: string;
    delete: string;
    cancel: string;
    save: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface GanttPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    grid?: PassThroughOption<HTMLElement, any>;
    chart?: PassThroughOption<HTMLElement, any>;
    taskbar?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type GanttPassThrough<I = unknown> = PassThrough<I, GanttPassThroughOptions>;
