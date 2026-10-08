import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
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
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseComponent } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type {
    GanttActionEvent,
    GanttCellEditEvent,
    GanttColumn,
    GanttEditSettings,
    GanttEventMarker,
    GanttExpandEvent,
    GanttHoliday,
    GanttInvalidEvent,
    GanttLabelSettings,
    GanttPassThrough,
    GanttResource,
    GanttSelectEvent,
    GanttSplitterSettings,
    GanttTask,
    GanttTaskbarEvent,
    GanttTaskFields,
    GanttTimelineSettings
} from '@openng/optimus-ui/types/gantt';
import { fromDay, parseDay, toDay, WorkCalendar, type Day } from './gantt-calendar';
import { indentData, insertData, outdentData, patchFor, removeData, updateData, updateManyData } from './gantt-data';
import { buildProject, DEFAULT_FIELDS, findOverallocated, readProject, toTask, visibleNodes, type Node, type Project } from './gantt-model';
import { dayWidthFor, formatDay, nearestZoom, polylinePath, routeDependency, startOfUnit, tierCells, ZOOM_LEVELS, type Anchor, type TierCell, type TierUnit } from './gantt-timeline';
import { pdfFromJpeg, toCsv, toSvg as snapshotToSvg, type ExportSnapshot } from './gantt-export';
import { GanttStyle } from './style/ganttstyle';

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DEFAULT_COLUMNS: GanttColumn[] = [
    { field: 'id', headerText: 'ID', width: 56 },
    { field: 'name', headerText: 'Task', width: 220 },
    { field: 'startDate', headerText: 'Start', width: 104 },
    { field: 'duration', headerText: 'Days', width: 64, textAlign: 'right' },
    { field: 'progress', headerText: '%', width: 56, textAlign: 'right' }
];

/** What one bar looks like. */
interface Bar {
    id: string;
    left: number;
    top: number;
    width: number;
    height: number;
    progressWidth: number;
    isParent: boolean;
    isMilestone: boolean;
    critical: boolean;
    selected: boolean;
    dragging: boolean;
    editable: boolean;
    baseline: { left: number; width: number } | null;
    overallocated: boolean;
    taskLabel: string;
    leftLabel: string;
    rightLabel: string;
    title: string;
}

interface Row {
    task: GanttTask;
    node: Node;
    index: number;
    selected: boolean;
}

interface Link {
    key: string;
    d: string;
    critical: boolean;
}

/** A bar being changed by the user. */
interface Session {
    id: string;
    action: GanttTaskbarEvent['action'];
    pointerId: number;
    startX: number;
    barLeft: number;
    barWidth: number;
    original: { start: Day; end: Day; duration: number; progress: number };
    started: boolean;
}

interface Preview {
    id: string;
    start: Day;
    end: Day;
    duration: number;
    progress: number;
}

let nextId = 0;

/**
 * Gantt plans tasks on a timeline: a grid of tasks beside a chart of bars.
 *
 * Tasks have dependencies (`FS`, `SS`, `FF`, `SF`, with offsets) that move their successors, parents that roll up their children, a
 * working calendar with a work week and holidays, and a critical path. The user moves and resizes bars, drags their progress,
 * expands and collapses parents, and indents and outdents tasks, with the pointer or the keyboard.
 *
 * The API follows Syncfusion's Gantt: `dataSource`, `taskFields`, `columns`, `timelineSettings`, `splitterSettings`, `editSettings`,
 * `labelSettings`, `workWeek`, `holidays`, `enableCriticalPath`, `height`, the `created`, `actionBegin`, `actionComplete`,
 * `taskbarEditing`, `taskbarEdited`, `rowSelected`, `expanding`, `expanded`, `collapsing` and `collapsed` events, and the `addRecord`,
 * `updateRecordByID`, `deleteRecord`, `indent`, `outdent`, `expandAll`, `collapseAll`, `zoomIn`, `zoomOut`, `zoomToFit`, `scrollToTask`
 * and `setSplitterPosition` methods. Durations count worked time, in days, hours or minutes (`durationUnit`). Beyond Syncfusion's core it
 * has a baseline, resources with an over-allocation check, cell and dialog editing, and CSV, SVG, PNG and PDF export.
 *
 * @group Components
 */
@Component({
    selector: 'p-gantt',
    standalone: true,
    imports: [NgTemplateOutlet, SharedModule, Bind],
    template: `
        <div #scroller [class]="cx('scroll')" [style.height]="height()">
            <div class="p-gantt-inner" [style.width.px]="gridWidth() + 6 + chartWidth()">
                <div [class]="cx('head')" [style.height.px]="headHeight()">
                    <div [class]="cx('gridHead')" role="row" [style.width.px]="gridWidth()">
                        @for (col of columnList(); track col.field) {
                            <div class="p-gantt-head-cell" role="columnheader" [style.width.px]="col.width" [style.text-align]="col.textAlign">{{ col.headerText ?? col.field }}</div>
                        }
                    </div>
                    <div class="p-gantt-splitter-head" [style.width.px]="6" [style.left.px]="gridWidth()"></div>
                    <div [class]="cx('chartHead')" aria-hidden="true" [style.width.px]="chartWidth()">
                        <div [class]="cx('tier')" [style.height.px]="tierHeight()">
                            @for (c of topCells(); track $index) {
                                <div [class]="cx('tierCell')" [style.left.px]="c.x" [style.width.px]="c.width">{{ c.label }}</div>
                            }
                        </div>
                        <div [class]="cx('tier')" [style.height.px]="tierHeight()">
                            @for (c of bottomCells(); track $index) {
                                <div [class]="cx('tierCell')" [class.p-gantt-tier-cell-off]="isOff(c)" [style.left.px]="c.x" [style.width.px]="c.width">{{ c.width >= 14 ? c.label : '' }}</div>
                            }
                        </div>
                    </div>
                </div>
                <div class="p-gantt-body" [style.height.px]="bodyHeight()">
                    <div [class]="cx('grid')" role="treegrid" [attr.aria-label]="ariaLabel() || 'Tasks'" [attr.aria-rowcount]="rows().length" [style.width.px]="gridWidth()" (keydown)="onGridKeydown($event)">
                        @for (row of rows(); track row.task.id) {
                            <div
                                [class]="cx('row', { row })"
                                role="row"
                                [attr.aria-level]="row.task.level + 1"
                                [attr.aria-expanded]="row.task.isParent ? row.task.expanded : null"
                                [attr.aria-selected]="row.selected"
                                [attr.aria-description]="describe(row.task)"
                                [attr.data-row]="row.index"
                                [attr.tabindex]="row.selected || (selectedRowIndex() < 0 && row.index === 0) ? 0 : -1"
                                [style.height.px]="rowHeight()"
                                (click)="select(row.index)"
                                (dblclick)="onRowDblClick(row)"
                            >
                                @for (col of columnList(); track col.field; let ci = $index) {
                                    <div [class]="cx('cell')" role="gridcell" [attr.aria-readonly]="canEdit(row.task, col) ? null : 'true'" [style.width.px]="col.width" [style.text-align]="col.textAlign" (dblclick)="onCellDblClick($event, row, col)">
                                        @if (ci === treeColumn()) {
                                            <span class="p-gantt-indent" [style.width.px]="row.task.level * 16"></span>
                                            @if (row.task.isParent) {
                                                <button type="button" [class]="cx('toggle')" tabindex="-1" [attr.aria-label]="(row.task.expanded ? 'Collapse ' : 'Expand ') + row.task.name" (click)="toggle(row.task.id, $event)">
                                                    <span class="p-gantt-chevron" [class.p-gantt-chevron-open]="row.task.expanded" aria-hidden="true"></span>
                                                </button>
                                            } @else {
                                                <span class="p-gantt-toggle-gap"></span>
                                            }
                                        }
                                        @if (isEditing(row.index, col.field)) {
                                            <input
                                                #editor
                                                class="p-gantt-editor"
                                                [type]="editorType(col)"
                                                [attr.min]="col.field === 'duration' || col.field === 'progress' ? 0 : null"
                                                [attr.max]="col.field === 'progress' ? 100 : null"
                                                [attr.aria-label]="col.headerText ?? col.field"
                                                [attr.aria-invalid]="editInvalid() ? 'true' : null"
                                                [value]="editorValue(row.task, col)"
                                                (keydown)="onEditorKey($event, row, col)"
                                                (blur)="onEditorBlur($event, row, col)"
                                                (click)="$event.stopPropagation()"
                                                (dblclick)="$event.stopPropagation()"
                                            />
                                        } @else if (col.template; as tpl) {
                                            <ng-container *ngTemplateOutlet="tpl; context: { $implicit: row.task, value: valueOf(row.task, col) }" />
                                        } @else {
                                            <span class="p-gantt-cell-text">{{ textOf(row.task, col) }}</span>
                                        }
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <div
                        [class]="cx('splitter')"
                        role="separator"
                        aria-orientation="vertical"
                        tabindex="0"
                        aria-label="Resize the task list"
                        [attr.aria-valuenow]="gridWidth()"
                        [style.left.px]="gridWidth()"
                        (pointerdown)="onSplitterDown($event)"
                        (pointermove)="onSplitterMove($event)"
                        (pointerup)="onSplitterUp($event)"
                        (pointercancel)="onSplitterUp($event)"
                        (keydown)="onSplitterKey($event)"
                    ></div>
                    <div
                        [class]="cx('chart')"
                        aria-hidden="true"
                        [style.width.px]="chartWidth()"
                        [style.height.px]="bodyHeight()"
                        [style.--p-gantt-row-height]="rowHeight() + 'px'"
                        (pointermove)="onBarMove($event)"
                        (pointerup)="onBarUp($event)"
                        (pointercancel)="onBarCancel($event)"
                    >
                        @for (s of shades(); track $index) {
                            <div [class]="cx('shade')" [style.left.px]="s.x" [style.width.px]="s.width"></div>
                        }
                        @for (x of lineXs(); track $index) {
                            <div [class]="cx('line')" [style.left.px]="x"></div>
                        }
                        @for (m of markers(); track $index) {
                            <div [class]="cx('marker')" [style.left.px]="m.x" [attr.title]="m.label">
                                <span>{{ m.label }}</span>
                            </div>
                        }
                        @if (todayX(); as x) {
                            <div [class]="cx('today')" [style.left.px]="x"></div>
                        }
                        <svg [class]="cx('links')" [attr.width]="chartWidth()" [attr.height]="bodyHeight()">
                            <defs>
                                <marker id="p-gantt-arrow-{{ uid }}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" class="p-gantt-arrow" /></marker>
                            </defs>
                            @for (l of links(); track l.key) {
                                <path [class]="cx('link', { link: l })" [attr.d]="l.d" fill="none" [attr.marker-end]="'url(#p-gantt-arrow-' + uid + ')'" />
                            }
                        </svg>
                        @for (b of bars(); track b.id) {
                            @if (b.baseline; as plan) {
                                <div class="p-gantt-baseline" [style.left.px]="plan.left" [style.width.px]="plan.width" [style.top.px]="b.top + b.height + 2"></div>
                            }
                            <div
                                [class]="cx('taskbar', { bar: b })"
                                [style.left.px]="b.left"
                                [style.top.px]="b.top"
                                [style.width.px]="b.width"
                                [style.height.px]="b.height"
                                [attr.title]="timelineSettings().showTooltip === false ? null : b.title"
                                [attr.data-id]="b.id"
                                (pointerdown)="onBarDown($event, b)"
                                (click)="onBarClick(b)"
                            >
                                @if (b.leftLabel) {
                                    <span [class]="cx('label', { side: 'left' })">{{ b.leftLabel }}</span>
                                }
                                @if (!b.isMilestone) {
                                    <div [class]="cx('progress')" [style.width.px]="b.progressWidth"></div>
                                    @if (b.taskLabel && b.width >= 40) {
                                        <span class="p-gantt-taskbar-text">{{ b.taskLabel }}</span>
                                    }
                                    @if (b.editable) {
                                        <span [class]="cx('handle', { side: 'start' })" data-handle="resizeStart"></span>
                                        <span [class]="cx('handle', { side: 'end' })" data-handle="resizeEnd"></span>
                                        <span class="p-gantt-progress-knob" data-handle="progress" [style.left.px]="b.progressWidth"></span>
                                    }
                                }
                                @if (b.rightLabel) {
                                    <span [class]="cx('label', { side: 'right' })">{{ b.rightLabel }}</span>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
        <dialog #dialog class="p-gantt-dialog" [attr.aria-labelledby]="'p-gantt-dlg-title-' + uid" (close)="onDialogClosed()">
            @if (dialogTask(); as t) {
                <form class="p-gantt-form" (submit)="saveDialog($event, t)">
                    <h3 [id]="'p-gantt-dlg-title-' + uid" class="p-gantt-form-title">{{ t.name || 'Task' }}</h3>
                    <label>Name<input name="name" required [value]="t.name" /></label>
                    <div class="p-gantt-form-row">
                        <label>Start<input [type]="calendar().slots > 1 ? 'datetime-local' : 'date'" name="startDate" [disabled]="t.isParent" [value]="isoOf(t.startDate)" /></label>
                        <label>Duration ({{ durationUnit() }}s)<input type="number" name="duration" min="0" step="any" [disabled]="t.isParent" [value]="t.duration" /></label>
                        <label>Progress (%)<input type="number" name="progress" min="0" max="100" [disabled]="t.isParent" [value]="Math.round(t.progress)" /></label>
                    </div>
                    <label>Predecessors<input name="dependency" [value]="dependencyText(t)" placeholder="2FS+1d, 3SS" /></label>
                    @if (resources().length) {
                        <fieldset class="p-gantt-form-resources">
                            <legend>Resources</legend>
                            @for (r of resources(); track r.id) {
                                <label class="p-gantt-check"><input type="checkbox" name="resource" [value]="r.id" [checked]="hasResource(t, r)" />{{ r.name }}</label>
                            }
                        </fieldset>
                    }
                    @if (taskFields().notes) {
                        <label>Notes<textarea name="notes" rows="3" [value]="t.notes ?? ''"></textarea></label>
                    }
                    <div class="p-gantt-form-actions">
                        @if (editSettings().allowDeleting) {
                            <button type="button" class="p-gantt-btn p-gantt-btn-danger" (click)="deleteFromDialog(t)">Delete</button>
                        }
                        <span class="p-gantt-spacer"></span>
                        <button type="button" class="p-gantt-btn" (click)="closeDialog()">Cancel</button>
                        <button type="submit" class="p-gantt-btn p-gantt-btn-primary">Save</button>
                    </div>
                </form>
            }
        </dialog>
        <div class="p-gantt-sr" role="status" aria-live="polite" aria-atomic="true">{{ announcement() }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [GanttStyle, { provide: PARENT_INSTANCE, useExisting: Gantt }],
    host: { '[class]': 'cx("root")', 'data-scope': 'gantt', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class Gantt extends BaseComponent<GanttPassThrough> {
    componentName = 'Gantt';

    /** @internal */
    _componentStyle = inject(GanttStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
    private readonly editorRef = viewChild<ElementRef<HTMLInputElement>>('editor');
    private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialog');

    /** @internal */
    protected readonly Math = Math;

    /** @internal */
    readonly uid = nextId++;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The tasks, nested by `child` or flat with `parentID`. Supports `[(dataSource)]`: an edit hands back the new data.
     * @group Props
     */
    readonly dataSource = model<any[]>([]);
    /**
     * Which field of an item feeds which part of a task.
     * @group Props
     */
    readonly taskFields = input<GanttTaskFields>({});
    /**
     * The columns of the grid.
     * @group Props
     */
    readonly columns = input<GanttColumn[]>(DEFAULT_COLUMNS);
    /**
     * The header of the timeline and its zoom.
     * @group Props
     */
    readonly timelineSettings = input<GanttTimelineSettings>({});
    /**
     * The width of the grid.
     * @group Props
     */
    readonly splitterSettings = input<GanttSplitterSettings>({ position: '42%' });
    /**
     * What the user may change.
     * @group Props
     */
    readonly editSettings = input<GanttEditSettings>({});
    /**
     * Text beside and inside the bars.
     * @group Props
     */
    readonly labelSettings = input<GanttLabelSettings>({});
    /**
     * The weekdays that are worked, by name or number (0 for Sunday).
     * @group Props
     */
    readonly workWeek = input<(string | number)[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    /**
     * The unit durations are written in, in the data and on screen. With `hour` or `minute` a task can be shorter than a day, and a
     * start or an end carries a time.
     * @group Props
     */
    readonly durationUnit = input<'day' | 'hour' | 'minute'>('day');
    /**
     * The hours of a worked day: when it starts and when it ends.
     * @group Props
     */
    readonly workingHours = input<[number, number]>([8, 16]);
    /**
     * Days with no work.
     * @group Props
     */
    readonly holidays = input<GanttHoliday[]>([]);
    /**
     * Dates to mark on the chart.
     * @group Props
     */
    readonly eventMarkers = input<GanttEventMarker[]>([]);
    /**
     * The people or things tasks are assigned to. A task names them in the `resourceInfo` field.
     * @group Props
     */
    readonly resources = input<GanttResource[]>([]);
    /**
     * Draws the plan of each task under its bar, from the `baselineStartDate` and `baselineEndDate` fields.
     * @group Props
     */
    readonly renderBaseline = input(false, { transform: booleanAttribute });
    /**
     * Highlights the tasks that cannot slip without moving the end of the project.
     * @group Props
     */
    readonly enableCriticalPath = input(false, { transform: booleanAttribute });
    /**
     * Shades the days with no work.
     * @group Props
     */
    readonly highlightNonWorking = input(true, { transform: booleanAttribute });
    /**
     * The first day of the project. Defaults to a week before the first task.
     * @group Props
     */
    readonly projectStartDate = input<Date | string | undefined>(undefined);
    /**
     * The last day of the project. Defaults to two weeks after the last task.
     * @group Props
     */
    readonly projectEndDate = input<Date | string | undefined>(undefined);
    /**
     * The weekday weeks start on, 0 for Sunday.
     * @group Props
     */
    readonly weekStartDay = input(1, { transform: numberAttribute });
    /**
     * Height of the gantt. Rows scroll inside it.
     * @group Props
     */
    readonly height = input<string>('450px');
    /**
     * Height of a row, in pixels.
     * @group Props
     */
    readonly rowHeight = input(36, { transform: numberAttribute });
    /**
     * Height of a bar, in pixels. Defaults to 60% of the row.
     * @group Props
     */
    readonly taskbarHeight = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined || v === null || v === '' ? undefined : numberAttribute(v, undefined as any)) });
    /**
     * Starts with every parent collapsed.
     * @group Props
     */
    readonly collapseOnLoad = input(false, { transform: booleanAttribute });
    /**
     * The row that is selected, from 0, or -1. Supports `[(selectedRowIndex)]`.
     * @group Props
     */
    readonly selectedRowIndex = model<number>(-1);
    /**
     * The locale of the dates.
     * @group Props
     */
    readonly locale = input<string | undefined>(undefined);
    /**
     * Accessible name of the grid.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /** Fires once, when the gantt is ready. @group Emits */
    readonly created = output<void>();
    /** Fires before a cell edit is written. Change `value`, or set `cancel` to stop it. @group Emits */
    readonly cellEdit = output<GanttCellEditEvent>();
    /** Fires before an action. Set `cancel` to stop it. @group Emits */
    readonly actionBegin = output<GanttActionEvent>();
    /** Fires after an action. @group Emits */
    readonly actionComplete = output<GanttActionEvent>();
    /** Fires as a bar is moved, resized or its progress dragged. Set `cancel` to stop the edit. @group Emits */
    readonly taskbarEditing = output<GanttTaskbarEvent>();
    /** Fires when a bar was changed. @group Emits */
    readonly taskbarEdited = output<GanttTaskbarEvent>();
    /** Fires when a row is selected. @group Emits */
    readonly rowSelected = output<GanttSelectEvent>();
    /** Fires before a parent expands. Set `cancel` to stop it. @group Emits */
    readonly expanding = output<GanttExpandEvent>();
    /** Fires after a parent expanded. @group Emits */
    readonly expanded = output<GanttExpandEvent>();
    /** Fires before a parent collapses. Set `cancel` to stop it. @group Emits */
    readonly collapsing = output<GanttExpandEvent>();
    /** Fires after a parent collapsed. @group Emits */
    readonly collapsed = output<GanttExpandEvent>();
    /** Fires when the data has a problem: a loop of dependencies, a missing predecessor, a repeated id. @group Emits */
    readonly invalid = output<GanttInvalidEvent>();

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    private readonly collapsedIds = signal<ReadonlySet<string>>(new Set());
    private readonly dayWidthOverride = signal<number | null>(null);
    private readonly gridWidthOverride = signal<number | null>(null);
    private readonly viewportWidth = signal(1000);
    private readonly preview = signal<Preview | null>(null);
    /** The task whose dialog is open. @internal */
    readonly dialogTaskId = signal<string | null>(null);
    /** @internal */
    readonly dialogTask = computed(() => {
        const id = this.dialogTaskId();
        const node = id === null ? undefined : this.project().byId.get(id);

        return node ? this.mk(node, true) : null;
    });
    private readonly editingCell = signal<{ row: number; field: string } | null>(null);
    /** `true` while the text in the editor cannot be read. @internal */
    readonly editInvalid = signal(false);
    private session: Session | null = null;
    private closingDialog = false;
    private splitter: { pointerId: number; startX: number; startWidth: number } | null = null;
    private loadedCollapse = false;
    private readonly today = toDay(new Date());

    /** `true` while a bar is being changed. @internal */
    readonly busy = computed(() => !!this.preview());
    /** @internal */
    readonly announcement = signal('');

    /** @internal */
    readonly canEditBars = computed(() => this.editSettings().allowTaskbarEditing === true);

    /** @internal */
    readonly calendar = computed(() => {
        const week = this.workWeek()
            .map((d) => (typeof d === 'number' ? d : WEEKDAYS.indexOf(String(d).toLowerCase())))
            .filter((d) => d >= 0 && d <= 6);
        const holidays = this.holidays()
            .map((h) => {
                const from = parseDay(h.from);
                const to = parseDay(h.to ?? h.from);

                return from === null || to === null ? null : { from, to: Math.max(from, to) };
            })
            .filter((h): h is { from: Day; to: Day } => !!h);

        return new WorkCalendar({ workWeek: week, holidays, durationUnit: this.durationUnit(), workingHours: this.workingHours() });
    });

    private readonly fields = computed(() => ({ ...DEFAULT_FIELDS, ...this.taskFields() }));

    private readonly firstDay = computed(() => {
        const given = parseDay(this.projectStartDate());

        if (given !== null) return given;

        const raw = readProject(this.dataSource(), this.taskFields(), this.calendar(), this.today);
        const starts = raw.nodes.filter((n) => !n.placed).map((n) => n.start);

        return starts.length ? this.calendar().dayOf(Math.min(...starts)) : this.today;
    });

    /** The project, scheduled. @internal */
    readonly project = computed<Project>(() => buildProject(this.dataSource(), this.taskFields(), this.calendar(), this.firstDay()));

    private readonly overallocated = computed(() => findOverallocated(this.project(), this.resources()));

    private mk(node: Node, expanded: boolean): GanttTask {
        return toTask(node, expanded, this.calendar(), this.resources(), this.overallocated());
    }

    private readonly visible = computed(() => visibleNodes(this.project(), this.collapsedIds()));

    /** The rows of the grid. @internal */
    readonly rows = computed<Row[]>(() => {
        const selected = this.selectedRowIndex();
        const collapsed = this.collapsedIds();

        return this.visible().map((node, index) => ({ node, index, selected: index === selected, task: this.mk(node, !collapsed.has(node.id)) }));
    });

    /** @internal */
    readonly columnList = computed<GanttColumn[]>(() => this.columns().map((c) => ({ width: 100, ...c })));

    /** The column that holds the tree: the name. @internal */
    readonly treeColumn = computed(() =>
        Math.max(
            0,
            this.columnList().findIndex((c) => c.field === 'name' || c.field === this.fields().name)
        )
    );

    private readonly columnsWidth = computed(() => this.columnList().reduce((s, c) => s + (c.width ?? 100), 0));

    /** @internal */
    readonly gridWidth = computed(() => {
        const override = this.gridWidthOverride();

        if (override !== null) return override;

        const pos = this.splitterSettings().position ?? '42%';
        const total = this.viewportWidth();
        const px = typeof pos === 'number' ? pos : pos.endsWith('%') ? (parseFloat(pos) / 100) * total : parseFloat(pos);

        return this.clampGrid(Number.isFinite(px) ? px : this.columnsWidth());
    });

    private clampGrid(px: number): number {
        const total = this.viewportWidth();
        const s = this.splitterSettings();
        const bound = (v: string | number | undefined, fallback: number) => (v === undefined ? fallback : typeof v === 'number' ? v : v.endsWith('%') ? (parseFloat(v) / 100) * total : parseFloat(v));

        return Math.round(Math.min(Math.max(px, bound(s.minimum, 160)), bound(s.maximum, Math.max(total - 120, 200))));
    }

    /** @internal */
    readonly dayWidth = computed(() => {
        const override = this.dayWidthOverride();

        if (override !== null) return override;

        const t = this.timelineSettings();
        const unit = t.bottomTier?.unit;

        if (t.timelineUnitSize && unit) return dayWidthFor(unit, t.timelineUnitSize);
        if (t.timelineUnitSize) return t.timelineUnitSize;

        return ZOOM_LEVELS[4].dayWidth;
    });

    private readonly zoom = computed(() => ZOOM_LEVELS[nearestZoom(this.dayWidth())]);

    private readonly topTier = computed(() => ({ unit: (this.timelineSettings().topTier?.unit ?? this.zoom().top) as TierUnit, format: this.timelineSettings().topTier?.format }));
    private readonly bottomTier = computed(() => ({ unit: (this.timelineSettings().bottomTier?.unit ?? this.zoom().bottom) as TierUnit, format: this.timelineSettings().bottomTier?.format }));

    /** The days the chart covers: `from` to the day after `to`. */
    private readonly range = computed(() => {
        const nodes = this.project().nodes;
        const given = { from: parseDay(this.projectStartDate()), to: parseDay(this.projectEndDate()) };
        const cal = this.calendar();
        const first = nodes.length ? cal.dayOf(Math.min(...nodes.map((n) => n.start))) : this.today;
        const last = nodes.length ? cal.dayOf(Math.max(...nodes.map((n) => n.end))) : this.today + 30;
        const from = given.from ?? startOfUnit(first - 7, 'week', this.weekStartDay());
        const to = given.to !== null ? given.to + 1 : last + 15;

        return { from, to: Math.max(to, from + 14) };
    });

    /** @internal */
    readonly chartWidth = computed(() => Math.max(Math.round((this.range().to - this.range().from) * this.dayWidth()), 100));
    /** @internal */
    readonly tierHeight = computed(() => 26);
    /** @internal */
    readonly headHeight = computed(() => this.tierHeight() * 2);
    /** @internal */
    readonly bodyHeight = computed(() => Math.max(this.rows().length * this.rowHeight(), this.rowHeight()));

    /** @internal */
    readonly topCells = computed<TierCell[]>(() => tierCells(this.range().from, this.range().to, this.topTier(), this.dayWidth(), this.weekStartDay(), this.locale()));
    /** @internal */
    readonly bottomCells = computed<TierCell[]>(() => tierCells(this.range().from, this.range().to, this.bottomTier(), this.dayWidth(), this.weekStartDay(), this.locale()));

    /** @internal */
    isOff(cell: TierCell): boolean {
        return this.bottomTier().unit === 'day' && !this.calendar().isWorking(cell.from);
    }

    /** Vertical lines at the edges of the cells of the bottom tier. @internal */
    readonly lineXs = computed(() => {
        const cells = this.bottomCells();

        return cells.length > 1500 ? this.topCells().map((c) => c.x) : cells.map((c) => c.x).filter((x) => x > 0);
    });

    /** @internal */
    readonly shades = computed(() => {
        if (!this.highlightNonWorking() || this.dayWidth() < 3) return [];

        const { from, to } = this.range();

        return this.calendar()
            .nonWorkingRuns(from, to - 1)
            .map((r) => ({ x: (r.from - from) * this.dayWidth(), width: (r.to - r.from + 1) * this.dayWidth() }));
    });

    /** @internal */
    readonly markers = computed(() =>
        this.eventMarkers()
            .map((m) => ({ day: parseDay(m.day), label: m.label ?? '' }))
            .filter((m): m is { day: Day; label: string } => m.day !== null && m.day >= this.range().from && m.day < this.range().to)
            .map((m) => ({ x: (m.day - this.range().from) * this.dayWidth(), label: m.label }))
    );

    /** @internal */
    readonly todayX = computed(() => (this.today >= this.range().from && this.today < this.range().to ? (this.today - this.range().from) * this.dayWidth() + this.dayWidth() / 2 : null));

    /** Where a span of units sits on the chart, in pixels. A milestone is a point at the middle of its slot. */
    private spanX(start: number, end: number): { left: number; width: number } {
        const S = this.calendar().slots;
        const dw = this.dayWidth();

        return { left: (start / S - this.range().from) * dw, width: Math.max(((end + 1 - start) / S) * dw, 3) };
    }

    private geometry(node: Node, preview: Preview | null): { left: number; width: number } {
        const p = preview && preview.id === node.id ? preview : null;
        const s = p?.start ?? node.start;
        const e = p?.end ?? node.end;
        const span = this.spanX(s, e);

        return node.duration === 0 && !node.childIds.length ? { left: span.left + this.dayWidth() / (2 * this.calendar().slots), width: 0 } : span;
    }

    /** A date as the gantt writes it: with the time when a day is more than one slot. @internal */
    fmtDate(date: Date): string {
        return new Intl.DateTimeFormat(this.locale(), this.calendar().slots > 1 ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(date);
    }

    /** The label of the unit of duration. @internal */
    readonly unitLabel = computed(() => ({ day: 'd', hour: 'h', minute: 'min' })[this.durationUnit()]);

    private label(task: GanttTask, spec: string | ((t: GanttTask) => string) | undefined): string {
        if (!spec) return '';
        if (typeof spec === 'function') return spec(task);

        const v = spec === 'startDate' || spec === 'endDate' ? this.fmtDate(spec === 'startDate' ? task.startDate : task.endDate) : ((task as any)[spec] ?? task.data?.[spec]);

        return v === undefined || v === null ? '' : String(v);
    }

    /** The bars. @internal */
    readonly bars = computed<Bar[]>(() => {
        const preview = this.preview();
        const rh = this.rowHeight();
        const bh = this.taskbarHeight() ?? Math.round(rh * 0.6);
        const labels = this.labelSettings();
        const editable = this.canEditBars();
        const critical = this.enableCriticalPath();

        return this.rows().map((r) => {
            const g = this.geometry(r.node, preview);
            const p = preview && preview.id === r.node.id ? preview : null;
            const progress = p?.progress ?? r.node.progress;
            const task = p ? { ...r.task, startDate: this.calendar().toDate(p.start, 'start'), endDate: this.calendar().toDate(p.end, 'end'), duration: p.duration / this.calendar().unitsPer(), progress } : r.task;
            const milestone = r.task.isMilestone;
            // A parent is a thinner bracket, a milestone a square turned on its corner.
            const size = r.task.isParent ? Math.max(Math.round(bh * 0.45), 8) : bh;

            return {
                id: r.task.id,
                left: milestone ? g.left - size / 2 : g.left,
                top: r.index * rh + (rh - size) / 2,
                width: milestone ? size : g.width,
                height: size,
                progressWidth: Math.round((g.width * progress) / 100),
                isParent: r.task.isParent,
                isMilestone: milestone,
                critical: critical && r.task.isCritical,
                selected: r.selected,
                dragging: !!p,
                editable: editable && !r.task.isParent && !milestone,
                baseline: this.renderBaseline() && r.node.baselineStart !== null && r.node.baselineEnd !== null ? this.spanX(r.node.baselineStart, r.node.baselineEnd) : null,
                overallocated: r.task.isOverallocated,
                taskLabel: this.label(task, labels.taskLabel ?? ((t: GanttTask) => `${Math.round(t.progress)}%`)),
                leftLabel: this.label(task, labels.leftLabel),
                rightLabel: this.label(task, labels.rightLabel),
                title: `${task.name}\n${this.fmtDate(task.startDate)} – ${this.fmtDate(task.endDate)}\n${task.duration} ${this.unitLabel()} · ${Math.round(task.progress)}%${r.task.variance ? ` · ${r.task.variance > 0 ? '+' : ''}${r.task.variance} ${this.unitLabel()} vs plan` : ''}${r.task.resources.length ? `\n${r.task.resources.map((x) => x.name).join(', ')}` : ''}${r.task.isOverallocated ? '\nOver-allocated' : ''}`
            };
        });
    });

    /** The dependency lines. @internal */
    readonly links = computed<Link[]>(() => {
        const preview = this.preview();
        const rh = this.rowHeight();
        const rowOf = new Map(this.rows().map((r) => [r.task.id, r]));
        const out: Link[] = [];
        const critical = this.enableCriticalPath();

        for (const r of this.rows()) {
            for (const dep of r.node.deps) {
                const pred = rowOf.get(dep.id);

                if (!pred) continue;

                const a = this.geometry(pred.node, preview);
                const b = this.geometry(r.node, preview);
                const ay = pred.index * rh + rh / 2;
                const by = r.index * rh + rh / 2;
                const leaving: Anchor = dep.type === 'SS' || dep.type === 'SF' ? { x: a.left, y: ay, dir: -1 } : { x: a.left + a.width, y: ay, dir: 1 };
                const entering: Anchor = dep.type === 'FF' || dep.type === 'SF' ? { x: b.left + b.width, y: by, dir: 1 } : { x: b.left, y: by, dir: -1 };

                out.push({ key: `${dep.id}>${r.task.id}:${dep.type}`, d: polylinePath(routeDependency(leaving, entering, rh)), critical: critical && pred.node.critical && r.node.critical });
            }
        }

        return out;
    });

    constructor() {
        super();

        afterNextRender(() => {
            const el = this.scroller().nativeElement;
            const observer = new ResizeObserver(() => this.viewportWidth.set(Math.max(el.clientWidth, 320)));

            observer.observe(el);
            this.destroyRef.onDestroy(() => observer.disconnect());
            this.viewportWidth.set(Math.max(el.clientWidth, 320));
            this.created.emit();
        });

        // Problems found in the data.
        effect(() => {
            const problems = this.project().problems;

            untracked(() => problems.forEach((p) => this.invalid.emit(p)));
        });

        // The dialog is a native modal: it traps the focus and closes on Escape by itself.
        effect(() => {
            const id = this.dialogTaskId();

            untracked(() =>
                queueMicrotask(() => {
                    const d = this.dialogRef()?.nativeElement;

                    if (id !== null && d && !d.open) d.showModal?.();
                })
            );
        });

        // Parents start collapsed when asked, once the data is there.
        effect(() => {
            const nodes = this.project().nodes;

            if (this.collapseOnLoad() && !this.loadedCollapse && nodes.length) {
                this.loadedCollapse = true;
                untracked(() => this.collapsedIds.set(new Set(nodes.filter((n) => n.childIds.length).map((n) => n.id))));
            }
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Grid
    // ---------------------------------------------------------------------------------------------

    /** The value of a column for a task. @internal */
    valueOf(task: GanttTask, col: GanttColumn): any {
        switch (col.field) {
            case 'id':
                return task.id;
            case 'name':
                return task.name;
            case 'startDate':
                return task.startDate;
            case 'endDate':
                return task.endDate;
            case 'duration':
                return task.duration;
            case 'progress':
                return Math.round(task.progress);
            case 'baselineStartDate':
                return task.baselineStartDate;
            case 'baselineEndDate':
                return task.baselineEndDate;
            case 'variance':
                return task.variance;
            case 'notes':
                return task.notes ?? '';
            case 'resourceInfo':
                return task.resources.map((r) => r.name).join(', ');
            case 'dependency':
                return task.dependencies.map((d) => `${d.id}${d.type}${d.offset ? (d.offset > 0 ? '+' : '-') + Math.abs(d.offset) + 'd' : ''}`).join(', ');
            default:
                return task.data?.[col.field];
        }
    }

    /** The text of a cell. @internal */
    textOf(task: GanttTask, col: GanttColumn): string {
        const v = this.valueOf(task, col);

        if (v instanceof Date) return col.format ? formatDay(toDay(v), col.format, 'day', this.locale()) : this.fmtDate(v);

        return v === undefined || v === null ? '' : String(v);
    }

    /** What a screen reader hears for a row beyond its cells. @internal */
    describe(task: GanttTask): string {
        const when = `${this.fmtDate(task.startDate)} to ${this.fmtDate(task.endDate)}`;

        return `${when}, ${Math.round(task.progress)}% complete${task.isMilestone ? ', milestone' : ''}${this.enableCriticalPath() && task.isCritical ? ', critical' : ''}`;
    }

    /** @internal */
    select(index: number, focus = false): void {
        const row = this.rows()[index];

        if (!row) return;

        this.selectedRowIndex.set(index);
        this.rowSelected.emit({ task: row.task, rowIndex: index });

        if (focus) queueMicrotask(() => (this.el.nativeElement as HTMLElement).querySelector<HTMLElement>(`[data-row="${index}"]`)?.focus({ preventScroll: false }));
    }

    /** @internal */
    toggle(id: string, event?: Event): void {
        event?.stopPropagation();

        if (this.collapsedIds().has(id)) this.expandByID(id);
        else this.collapseByID(id);
    }

    /** @internal */
    onGridKeydown(event: KeyboardEvent): void {
        // Keys typed into a cell editor belong to the editor.
        if ((event.target as HTMLElement).tagName === 'INPUT') return;

        const rows = this.rows();
        const i = this.selectedRowIndex() < 0 ? 0 : this.selectedRowIndex();
        const row = rows[i];

        if (!row) return;

        const alt = event.altKey && event.shiftKey;
        let handled = true;

        switch (event.key) {
            case 'ArrowDown':
                this.select(Math.min(i + 1, rows.length - 1), true);
                break;
            case 'ArrowUp':
                this.select(Math.max(i - 1, 0), true);
                break;
            case 'Home':
                this.select(0, true);
                break;
            case 'End':
                this.select(rows.length - 1, true);
                break;
            case 'ArrowRight':
                if (alt) this.indent(row.task.id);
                else if (row.task.isParent && !row.task.expanded) this.expandByID(row.task.id);
                else if (row.task.isParent) this.select(i + 1, true);
                break;
            case 'ArrowLeft':
                if (alt) this.outdent(row.task.id);
                else if (row.task.isParent && row.task.expanded) this.collapseByID(row.task.id);
                else if (row.task.parentId)
                    this.select(
                        rows.findIndex((r) => r.task.id === row.task.parentId),
                        true
                    );
                break;
            case 'F2': {
                const col = this.columnList().find((c) => this.canEdit(row.task, c));

                if (col) this.startEdit(row.index, col.field);
                else handled = false;
                break;
            }
            case 'Delete':
                if (this.editSettings().allowDeleting) this.deleteRecord(row.task.id);
                else handled = false;
                break;
            case ' ':
            case 'Enter':
                if (row.task.isParent) this.toggle(row.task.id);
                else this.scrollToTask(row.task.id);
                break;
            default:
                handled = false;
        }

        if (handled) event.preventDefault();
    }

    // ---------------------------------------------------------------------------------------------
    // Editing cells
    // ---------------------------------------------------------------------------------------------

    /** `true` when the user may edit this cell. A parent takes its dates, length and progress from its children. @internal */
    canEdit(task: GanttTask, col: GanttColumn): boolean {
        if (!this.editSettings().allowEditing || this.editSettings().mode === 'dialog' || col.template) return false;
        if (task.isParent && ['startDate', 'endDate', 'duration', 'progress'].includes(col.field)) return false;

        return col.field !== 'id';
    }

    /** @internal */
    isEditing(row: number, field: string): boolean {
        const e = this.editingCell();

        return !!e && e.row === row && e.field === field;
    }

    /** @internal */
    editorType(col: GanttColumn): string {
        switch (col.field) {
            case 'startDate':
            case 'endDate':
                return this.calendar().slots > 1 ? 'datetime-local' : 'date';
            case 'duration':
            case 'progress':
                return 'number';
            default:
                return 'text';
        }
    }

    /** The text the editor starts with. @internal */
    editorValue(task: GanttTask, col: GanttColumn): string {
        const v = this.valueOf(task, col);

        if (v instanceof Date) return this.isoOf(v);

        return v === undefined || v === null ? '' : String(v);
    }

    private startEdit(row: number, field: string): void {
        this.select(row);
        this.editInvalid.set(false);
        this.editingCell.set({ row, field });

        // The editor exists after the next render: focus it then.
        queueMicrotask(() =>
            setTimeout(() => {
                const input = this.editorRef()?.nativeElement;

                input?.focus();
                input?.select?.();
            })
        );
    }

    /** @internal */
    onCellDblClick(event: Event, row: Row, col: GanttColumn): void {
        if (this.editSettings().allowEditing && this.editSettings().mode === 'dialog') return;

        if (this.canEdit(row.task, col)) {
            event.stopPropagation();
            this.startEdit(row.index, col.field);
        }
    }

    /** @internal */
    onRowDblClick(row: Row): void {
        if (this.editSettings().allowEditing && this.editSettings().mode === 'dialog') this.openEditDialog(row.task.id);
        else this.scrollToTask(row.task.id);
    }

    /** @internal */
    onEditorKey(event: KeyboardEvent, row: Row, col: GanttColumn): void {
        event.stopPropagation();

        if (event.key === 'Escape') {
            event.preventDefault();
            this.stopEdit(row.index);
        } else if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();

            const input = event.target as HTMLInputElement;
            const ok = this.commitCell(row.task, col, input.value);

            if (!ok) return;

            this.stopEdit(row.index);

            // Tab goes on to the next cell that can be edited, in the row.
            if (event.key === 'Tab') {
                const cols = this.columnList();
                const at = cols.findIndex((c) => c.field === col.field);
                const next = event.shiftKey
                    ? cols
                          .slice(0, at)
                          .reverse()
                          .find((c) => this.canEdit(row.task, c))
                    : cols.slice(at + 1).find((c) => this.canEdit(row.task, c));

                if (next) this.startEdit(row.index, next.field);
            }
        }
    }

    /** @internal */
    onEditorBlur(event: FocusEvent, row: Row, col: GanttColumn): void {
        // Leaving the editor saves what is valid, and drops what is not.
        if (!this.isEditing(row.index, col.field)) return;

        this.commitCell(row.task, col, (event.target as HTMLInputElement).value);
        this.stopEdit(row.index);
    }

    private stopEdit(row: number): void {
        this.editingCell.set(null);
        this.editInvalid.set(false);
        queueMicrotask(() => (this.el.nativeElement as HTMLElement).querySelector<HTMLElement>(`[data-row="${row}"]`)?.focus({ preventScroll: true }));
    }

    /** Reads the text of an editor into the type of its field. `undefined` when it cannot be read. */
    private parseCell(field: string, text: string, previous: any): any {
        const t = text.trim();

        switch (field) {
            case 'startDate':
            case 'endDate': {
                const unit = this.calendar().parseUnit(t, field === 'startDate' ? 'start' : 'end');

                return unit === null ? undefined : this.calendar().toDate(unit, field === 'startDate' ? 'start' : 'end');
            }
            case 'duration': {
                const n = Number(t);

                return t !== '' && Number.isFinite(n) && n >= 0 ? n : undefined;
            }
            case 'progress': {
                const n = Number(t);

                return t !== '' && Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), 100) : undefined;
            }
            case 'dependency':
            case 'notes':
            case 'resourceInfo':
                return t;
            default:
                return typeof previous === 'number' && t !== '' && Number.isFinite(Number(t)) ? Number(t) : t;
        }
    }

    /** Writes an edited cell into the data. `false` when the text cannot be read, and the editor stays. */
    private commitCell(task: GanttTask, col: GanttColumn, text: string): boolean {
        const node = this.project().byId.get(task.id);

        if (!node) return true;

        const value = this.parseCell(col.field, text, this.valueOf(task, col));

        if (value === undefined || value === null) {
            this.editInvalid.set(true);

            return false;
        }

        // Nothing changed: nothing to write.
        if (text.trim() === this.editorValue(task, col)) return true;

        const event: GanttCellEditEvent = { task, field: col.field, value, cancel: false };

        this.cellEdit.emit(event);

        if (event.cancel) return true;

        const begin: GanttActionEvent = { requestType: 'save', data: node.data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return true;

        const f = { ...DEFAULT_FIELDS, ...this.taskFields() };
        const cal = this.calendar();
        let patch: Record<string, any>;

        switch (col.field) {
            case 'name':
                patch = { [f.name]: event.value };
                break;
            case 'startDate': {
                const start = cal.nextWorking(cal.parseUnit(event.value, 'start') ?? node.start);

                patch = patchFor(node.data, this.taskFields(), { start, end: cal.endFor(start, node.duration), duration: node.duration }, cal);
                break;
            }
            case 'endDate': {
                const end = Math.max(cal.parseUnit(event.value, 'end') ?? node.end, node.start);
                const duration = Math.max(cal.countWorking(node.start, end), 1);

                patch = patchFor(node.data, this.taskFields(), { end: cal.endFor(node.start, duration), duration }, cal);
                break;
            }
            case 'duration': {
                // A length in the unit of the gantt; the plan counts slots.
                const units = Math.round(event.value * cal.unitsPer());

                patch = patchFor(node.data, this.taskFields(), { end: cal.endFor(node.start, units), duration: units }, cal);
                break;
            }
            case 'progress':
                patch = patchFor(node.data, this.taskFields(), { progress: event.value }, cal);
                break;
            case 'dependency':
                patch = { [f.dependency]: event.value };
                break;
            case 'notes':
                patch = this.taskFields().notes ? { [this.taskFields().notes!]: event.value } : {};
                break;
            case 'resourceInfo': {
                const field = this.taskFields().resourceInfo;
                const ids = String(event.value)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                // The data keeps the shape it had: a string stays a string.
                patch = field ? { [field]: typeof node.data?.[field] === 'string' ? ids.join(',') : ids } : {};
                break;
            }
            default:
                patch = { [col.field]: event.value };
        }

        this.dataSource.set(this.settle(updateData(this.dataSource(), this.taskFields(), node.data, patch)));
        this.actionComplete.emit({ requestType: 'save', data: node.data, cancel: false });
        this.announcement.set(`${node.name}: ${col.headerText ?? col.field} changed`);

        return true;
    }

    // ---------------------------------------------------------------------------------------------
    // The edit dialog
    // ---------------------------------------------------------------------------------------------

    /** A date for an editor: the day, with the time when a day is more than one slot. @internal */
    isoOf(date: Date): string {
        const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        return this.calendar().slots > 1 ? `${day}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : day;
    }

    /** @internal */
    dependencyText(task: GanttTask): string {
        return this.valueOf(task, { field: 'dependency' });
    }

    /** @internal */
    hasResource(task: GanttTask, resource: GanttResource): boolean {
        return task.resources.some((r) => String(r.id) === String(resource.id));
    }

    /** Opens the form that edits a whole task. Mirrors Syncfusion's `openEditDialog`. */
    openEditDialog(id: string): void {
        if (this.project().byId.has(String(id))) this.dialogTaskId.set(String(id));
    }

    /** @internal */
    onDialogClosed(): void {
        // The close event of a dialog `closeDialog` shut arrives a turn late, perhaps after another task was opened: it says nothing new.
        if (this.closingDialog) {
            this.closingDialog = false;

            return;
        }

        // Escape: the dialog closed by itself.
        this.dialogTaskId.set(null);
    }

    /** Closes the form without saving. */
    closeDialog(): void {
        const dialog = this.dialogRef()?.nativeElement;

        if (dialog?.open) {
            this.closingDialog = true;
            dialog.close();
        }

        this.dialogTaskId.set(null);
    }

    /** @internal */
    deleteFromDialog(task: GanttTask): void {
        this.closeDialog();
        this.deleteRecord(task.id);
    }

    /** @internal */
    saveDialog(event: Event, task: GanttTask): void {
        event.preventDefault();

        const form = new FormData(event.target as HTMLFormElement);
        const text = (name: string) => String(form.get(name) ?? '');
        const ids = form.getAll('resource').map(String);
        // One field at a time, in an order that lets the later ones see the earlier ones: the dates need the new length.
        const steps: [string, string][] = [
            ['name', text('name')],
            ['dependency', text('dependency')],
            ['startDate', form.has('startDate') ? text('startDate') : ''],
            ['duration', form.has('duration') ? text('duration') : ''],
            ['progress', form.has('progress') ? text('progress') : ''],
            ['notes', this.taskFields().notes ? text('notes') : ''],
            ['resourceInfo', this.resources().length ? ids.join(',') : '']
        ];

        for (const [field, value] of steps) {
            if (['startDate', 'duration', 'progress'].includes(field) && (task.isParent || value === '')) continue;
            if (field === 'notes' && !this.taskFields().notes) continue;
            if (field === 'resourceInfo' && (!this.resources().length || !this.taskFields().resourceInfo)) continue;

            const fresh = this.getTaskByID(task.id);

            if (fresh) this.commitCell(fresh, { field }, value);
        }

        this.closeDialog();
    }

    // ---------------------------------------------------------------------------------------------
    // Export
    // ---------------------------------------------------------------------------------------------

    private download(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /** The grid as CSV: every task, parents included, in the order of the tree. Downloads it unless `download` is false. Mirrors Syncfusion's `csvExport`. */
    exportToCsv(options: { fileName?: string; download?: boolean } = {}): string {
        const cols = this.columnList();
        const header = cols.map((c) => c.headerText ?? c.field);
        const body = this.project().nodes.map((n) => {
            const task = this.mk(n, true);

            return cols.map((c) => {
                const v = this.valueOf(task, c);

                return v instanceof Date ? this.isoOf(v) : v;
            });
        });
        const csv = toCsv([header, ...body]);

        if ((options.download ?? true) && this.browser) this.download(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }), `${options.fileName ?? 'gantt'}.csv`);

        return csv;
    }

    private snapshot(): ExportSnapshot {
        const host = this.el.nativeElement as HTMLElement;
        const style = (sel: string, prop: string, fallback: string) => {
            const el = host.querySelector(sel);

            return (el && getComputedStyle(el).getPropertyValue(prop)) || fallback;
        };
        const rootStyle = getComputedStyle(host);
        const cols = this.columnList();
        const visible = this.rows();
        const rh = this.rowHeight();
        const head = this.headHeight();
        const grid = cols.reduce((s, c) => s + (c.width ?? 100), 0);

        return {
            width: grid + this.chartWidth(),
            height: head + Math.max(visible.length * rh, rh),
            headHeight: head,
            gridWidth: grid,
            chartWidth: this.chartWidth(),
            rowHeight: rh,
            font: rootStyle.fontFamily || 'sans-serif',
            colors: {
                text: rootStyle.color || '#111',
                muted: style('.p-gantt-head-cell', 'color', '#666'),
                line: style('.p-gantt-row', 'border-bottom-color', '#ddd'),
                background: style('.p-gantt', 'background-color', '#fff') === 'rgba(0, 0, 0, 0)' ? '#fff' : style('.p-gantt', 'background-color', '#fff'),
                header: style('.p-gantt-head', 'background-color', '#f3f4f6'),
                shade: style('.p-gantt-shade', 'background-color', 'rgba(0,0,0,0.05)'),
                bar: style('.p-gantt-taskbar:not(.p-gantt-taskbar-parent):not(.p-gantt-taskbar-critical)', 'background-color', '#93c5fd'),
                progress: style('.p-gantt-taskbar:not(.p-gantt-taskbar-critical) .p-gantt-progress', 'background-color', '#2563eb'),
                parent: style('.p-gantt-taskbar-parent', 'background-color', '#555'),
                critical: style('.p-gantt-taskbar-critical', 'background-color', '#fca5a5'),
                criticalProgress: style('.p-gantt-taskbar-critical .p-gantt-progress', 'background-color', '#ef4444'),
                link: style('.p-gantt-link', 'stroke', '#888'),
                criticalLink: style('.p-gantt-link-critical', 'stroke', '#ef4444'),
                today: style('.p-gantt-today', 'background-color', '#16a34a'),
                baseline: style('.p-gantt-baseline', 'background-color', '#9ca3af')
            },
            treeColumn: this.treeColumn(),
            columns: cols.map((c) => ({ header: c.headerText ?? c.field, width: c.width ?? 100, align: c.textAlign ?? 'left' })),
            rows: visible.map((r) => ({ y: r.index * rh, cells: cols.map((c) => this.textOf(r.task, c)), level: r.task.level, bold: r.task.isParent })),
            tiers: { top: this.topCells().map((c) => ({ x: c.x, width: c.width, label: c.label })), bottom: this.bottomCells().map((c) => ({ x: c.x, width: c.width, label: c.label })), height: this.tierHeight() },
            shades: this.shades(),
            lines: this.lineXs(),
            bars: this.bars().map((b) => ({
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                progressWidth: b.progressWidth,
                isParent: b.isParent,
                isMilestone: b.isMilestone,
                critical: b.critical,
                baseline: b.baseline,
                label: b.rightLabel
            })),
            links: this.links().map((l) => ({ d: l.d, critical: l.critical })),
            todayX: this.todayX()
        };
    }

    /** The whole gantt, grid and chart, as an SVG document. Mirrors Syncfusion's export in a format a vector tool can open. */
    exportToSvg(options: { fileName?: string; download?: boolean } = {}): string {
        const svg = snapshotToSvg(this.snapshot());

        if ((options.download ?? true) && this.browser) this.download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${options.fileName ?? 'gantt'}.svg`);

        return svg;
    }

    /** The whole gantt as a PNG or a JPEG. Resolves to the blob. */
    async exportToImage(options: { fileName?: string; format?: 'png' | 'jpeg'; scale?: number; download?: boolean } = {}): Promise<Blob> {
        const format = options.format ?? 'png';
        const scale = options.scale ?? 2;
        const snap = this.snapshot();
        const svg = snapshotToSvg(snap);
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('The gantt could not be drawn'));
            image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        });

        const canvas = document.createElement('canvas');

        canvas.width = Math.round(snap.width * scale);
        canvas.height = Math.round(snap.height * scale);

        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = snap.colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The image is empty'))), `image/${format}`, 0.92));

        if ((options.download ?? true) && this.browser) this.download(blob, `${options.fileName ?? 'gantt'}.${format === 'jpeg' ? 'jpg' : 'png'}`);

        return blob;
    }

    /** The whole gantt as a one-page PDF, holding a picture of it. Resolves to the file. Mirrors Syncfusion's `pdfExport`. */
    async exportToPdf(options: { fileName?: string; scale?: number; download?: boolean } = {}): Promise<Blob> {
        const snap = this.snapshot();
        const jpeg = await this.exportToImage({ format: 'jpeg', scale: options.scale ?? 2, download: false });
        const bytes = new Uint8Array(await jpeg.arrayBuffer());
        // One CSS pixel is 0.75 points.
        const pdf = new Blob([pdfFromJpeg(bytes, Math.round(snap.width * (options.scale ?? 2)), Math.round(snap.height * (options.scale ?? 2)), snap.width * 0.75, snap.height * 0.75) as BlobPart], { type: 'application/pdf' });

        if ((options.download ?? true) && this.browser) this.download(pdf, `${options.fileName ?? 'gantt'}.pdf`);

        return pdf;
    }

    // ---------------------------------------------------------------------------------------------
    // Splitter
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    onSplitterDown(event: PointerEvent): void {
        event.preventDefault();
        this.splitter = { pointerId: event.pointerId, startX: event.clientX, startWidth: this.gridWidth() };

        try {
            (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        } catch {
            /* the drag still works while the pointer stays over the bar */
        }
    }

    /** @internal */
    onSplitterMove(event: PointerEvent): void {
        const s = this.splitter;

        if (s && event.pointerId === s.pointerId) this.gridWidthOverride.set(this.clampGrid(s.startWidth + event.clientX - s.startX));
    }

    /** @internal */
    onSplitterUp(event: PointerEvent): void {
        if (this.splitter && event.pointerId === this.splitter.pointerId) this.splitter = null;
    }

    /** @internal */
    onSplitterKey(event: KeyboardEvent): void {
        const step = event.shiftKey ? 80 : 20;

        if (event.key === 'ArrowLeft') this.gridWidthOverride.set(this.clampGrid(this.gridWidth() - step));
        else if (event.key === 'ArrowRight') this.gridWidthOverride.set(this.clampGrid(this.gridWidth() + step));
        else return;

        event.preventDefault();
    }

    // ---------------------------------------------------------------------------------------------
    // Editing bars
    // ---------------------------------------------------------------------------------------------

    /** @internal */
    onBarClick(bar: Bar): void {
        const index = this.rows().findIndex((r) => r.task.id === bar.id);

        if (index >= 0 && index !== this.selectedRowIndex()) this.select(index);
    }

    /** @internal */
    onBarDown(event: PointerEvent, bar: Bar): void {
        if (!bar.editable || this.session || (event.pointerType === 'mouse' && event.button !== 0)) return;

        const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-handle]')?.dataset['handle'];
        const action = (handle as Session['action'] | undefined) ?? 'move';
        const node = this.project().byId.get(bar.id)!;

        event.preventDefault();
        this.session = {
            id: bar.id,
            action,
            pointerId: event.pointerId,
            startX: event.clientX,
            barLeft: (event.currentTarget as HTMLElement).getBoundingClientRect().left,
            barWidth: bar.width,
            original: { start: node.start, end: node.end, duration: node.duration, progress: node.progress },
            started: false
        };

        try {
            (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        } catch {
            /* the pointer is gone: the edit simply does not start */
        }
    }

    /** @internal */
    onBarMove(event: PointerEvent): void {
        const s = this.session;

        if (!s || event.pointerId !== s.pointerId) return;

        const dx = event.clientX - s.startX;

        if (!s.started && Math.abs(dx) < 3) return;

        s.started = true;
        event.preventDefault();

        const cal = this.calendar();
        const dw = this.dayWidth();
        // Whole days when a day is one slot; else the nearest hour, or the nearest slot when a slot is longer than an hour.
        const snap = Math.max(1, Math.round(cal.slots / cal.hoursPerDay));
        const days = Math.round(((dx / dw) * cal.slots) / snap) * snap;
        const o = s.original;
        let start = o.start;
        let end = o.end;
        let duration = o.duration;
        let progress = o.progress;

        switch (s.action) {
            case 'move':
                start = days >= 0 ? cal.nextWorking(o.start + days) : cal.prevWorking(o.start + days);
                end = cal.endFor(start, o.duration);
                break;
            case 'resizeEnd':
                end = Math.max(cal.prevWorking(o.end + days), o.start);
                duration = Math.max(cal.countWorking(o.start, end), 1);
                end = cal.endFor(o.start, duration);
                break;
            case 'resizeStart':
                start = Math.min(cal.nextWorking(o.start + days), o.end);
                duration = Math.max(cal.countWorking(start, o.end), 1);
                start = cal.startFor(o.end, duration);
                break;
            case 'progress':
                progress = Math.round(Math.min(Math.max(((event.clientX - s.barLeft) / Math.max(s.barWidth, 1)) * 100, 0), 100));
                break;
        }

        const node = this.project().byId.get(s.id)!;
        const next: Preview = { id: s.id, start, end, duration, progress };
        const task = { ...this.mk(node, true), startDate: cal.toDate(start, 'start'), endDate: cal.toDate(end, 'end'), duration: duration / cal.unitsPer(), progress };
        const e: GanttTaskbarEvent = { task, action: s.action, previousData: node.data, cancel: false };

        this.taskbarEditing.emit(e);

        if (e.cancel) {
            this.session = null;
            this.preview.set(null);

            return;
        }

        this.preview.set(next);
    }

    /** @internal */
    onBarUp(event: PointerEvent): void {
        const s = this.session;

        if (!s || event.pointerId !== s.pointerId) return;

        const p = this.preview();

        this.session = null;
        this.preview.set(null);

        if (!s.started || !p) return;

        const node = this.project().byId.get(s.id)!;
        const begin: GanttActionEvent = { requestType: 'taskbarEdit', data: node.data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        const task = { ...this.mk(node, true), startDate: this.calendar().toDate(p.start, 'start'), endDate: this.calendar().toDate(p.end, 'end'), duration: p.duration / this.calendar().unitsPer(), progress: p.progress };

        this.commitTaskEdit(node, { start: p.start, end: p.end, duration: p.duration, progress: s.action === 'progress' ? p.progress : undefined });
        this.taskbarEdited.emit({ task, action: s.action, previousData: node.data, cancel: false });
        this.actionComplete.emit({ requestType: 'taskbarEdit', data: node.data, cancel: false });
        this.announcement.set(s.action === 'progress' ? `${node.name} is ${p.progress}% complete` : `${node.name} now runs ${this.fmtDate(task.startDate)} to ${this.fmtDate(task.endDate)}`);
    }

    /** @internal */
    onBarCancel(event: PointerEvent): void {
        if (this.session && event.pointerId === this.session.pointerId) {
            this.session = null;
            this.preview.set(null);
        }
    }

    /**
     * Writes an edit into the data, lets the dependencies move what follows, and writes those moves too.
     * What the user changed wins over what the plan would have chosen.
     */
    private commitTaskEdit(node: Node, change: { start?: number; end?: number; duration?: number; progress?: number }): void {
        const f = this.taskFields();
        const data = this.dataSource();
        const edited = updateData(data, f, node.data, patchFor(node.data, f, change, this.calendar()));

        this.dataSource.set(this.settle(edited));
    }

    /** Schedules the data and writes any date the schedule moved back into it. */
    private settle(data: any[]): any[] {
        const f = this.taskFields();
        const cal = this.calendar();
        const start = this.firstDay();
        const raw = readProject(data, f, cal, start);
        const scheduled = buildProject(data, f, cal, start);
        const patches = new Map<any, Record<string, any>>();

        for (const n of scheduled.nodes) {
            const before = raw.byId.get(n.id);

            if (!before || (before.start === n.start && before.end === n.end && before.duration === n.duration)) continue;

            patches.set(n.data, patchFor(n.data, f, { start: n.start, end: n.end, duration: n.duration }, cal));
        }

        return patches.size ? updateManyData(data, f, patches) : data;
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    private nodeOf(id: string | undefined): Node | undefined {
        return id === undefined ? this.rows()[this.selectedRowIndex()]?.node : this.project().byId.get(String(id));
    }

    /** A task by its id. */
    getTaskByID(id: string): GanttTask | undefined {
        const n = this.project().byId.get(String(id));

        return n ? this.mk(n, !this.collapsedIds().has(n.id)) : undefined;
    }

    /** The tasks as they are shown: the parents that are collapsed hide theirs. Mirrors Syncfusion's `getCurrentViewRecords`. */
    getCurrentViewRecords(): GanttTask[] {
        return this.rows().map((r) => r.task);
    }

    /** The tasks on the critical path. */
    getCriticalTasks(): GanttTask[] {
        return this.project()
            .nodes.filter((n) => n.critical)
            .map((n) => this.mk(n, !this.collapsedIds().has(n.id)));
    }

    /** Adds a data item. Under `parentId` when given, at the top otherwise; `index` places it among its siblings. Mirrors Syncfusion's `addRecord`. */
    addRecord(record: any, parentId?: string, index?: number): void {
        const begin: GanttActionEvent = { requestType: 'add', data: record, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        const parent = parentId !== undefined ? this.nodeOf(parentId)?.data : null;
        const inserted = insertData(this.dataSource(), this.taskFields(), record, parent ?? null, index);

        this.dataSource.set(this.settle(inserted));
        this.actionComplete.emit({ requestType: 'add', data: record, cancel: false });
    }

    /** Changes the fields of the task with the id the data carries. Mirrors Syncfusion's `updateRecordByID`. */
    updateRecordByID(data: any): void {
        const id = data?.[this.fields().id];
        const node = this.nodeOf(id);

        if (!node) return;

        const begin: GanttActionEvent = { requestType: 'save', data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        this.dataSource.set(this.settle(updateData(this.dataSource(), this.taskFields(), node.data, { ...data })));
        this.actionComplete.emit({ requestType: 'save', data, cancel: false });
    }

    /** Removes a task and its children. Mirrors Syncfusion's `deleteRecord`. */
    deleteRecord(id: string): void {
        const node = this.nodeOf(id);

        if (!node) return;

        const begin: GanttActionEvent = { requestType: 'delete', data: node.data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        const keep = Math.min(this.selectedRowIndex(), this.rows().length - 2);

        this.dataSource.set(this.settle(removeData(this.dataSource(), this.taskFields(), node.data)));
        this.selectedRowIndex.set(keep);
        this.actionComplete.emit({ requestType: 'delete', data: node.data, cancel: false });
    }

    /** Makes a task a child of the one above it. Mirrors Syncfusion's `indent`. */
    indent(id?: string): void {
        const node = this.nodeOf(id);

        if (!node) return;

        const siblings = node.parentId
            ? this.project().byId.get(node.parentId)!.childIds
            : this.project()
                  .nodes.filter((n) => !n.parentId)
                  .map((n) => n.id);
        const above = siblings[siblings.indexOf(node.id) - 1];

        if (!above) return;

        const begin: GanttActionEvent = { requestType: 'indent', data: node.data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        this.dataSource.set(this.settle(indentData(this.dataSource(), this.taskFields(), node.data, this.project().byId.get(above)!.data)));
        this.collapsedIds.update((s) => {
            const next = new Set(s);

            next.delete(above);

            return next;
        });
        this.actionComplete.emit({ requestType: 'indent', data: node.data, cancel: false });
    }

    /** Makes a task a sibling of its parent. Mirrors Syncfusion's `outdent`. */
    outdent(id?: string): void {
        const node = this.nodeOf(id);

        if (!node?.parentId) return;

        const begin: GanttActionEvent = { requestType: 'outdent', data: node.data, cancel: false };

        this.actionBegin.emit(begin);

        if (begin.cancel) return;

        this.dataSource.set(this.settle(outdentData(this.dataSource(), this.taskFields(), node.data, this.project().byId.get(node.parentId)!.data)));
        this.actionComplete.emit({ requestType: 'outdent', data: node.data, cancel: false });
    }

    /** Expands a parent. Mirrors Syncfusion's `expandByID`. */
    expandByID(id: string): void {
        const node = this.nodeOf(id);

        if (!node?.childIds.length || !this.collapsedIds().has(node.id)) return;

        const e: GanttExpandEvent = { task: this.mk(node, false), cancel: false };

        this.expanding.emit(e);

        if (e.cancel) return;

        this.collapsedIds.update((s) => {
            const next = new Set(s);

            next.delete(node.id);

            return next;
        });
        this.expanded.emit({ task: this.mk(node, true), cancel: false });
    }

    /** Collapses a parent. Mirrors Syncfusion's `collapseByID`. */
    collapseByID(id: string): void {
        const node = this.nodeOf(id);

        if (!node?.childIds.length || this.collapsedIds().has(node.id)) return;

        const e: GanttExpandEvent = { task: this.mk(node, true), cancel: false };

        this.collapsing.emit(e);

        if (e.cancel) return;

        this.collapsedIds.update((s) => new Set(s).add(node.id));

        // A selection inside what just closed moves to the parent.
        const sel = this.rows()[this.selectedRowIndex()];

        if (!sel) this.selectedRowIndex.set(this.rows().findIndex((r) => r.task.id === node.id));

        this.collapsed.emit({ task: this.mk(node, false), cancel: false });
    }

    /** Expands every parent. Mirrors Syncfusion's `expandAll`. */
    expandAll(): void {
        this.collapsedIds.set(new Set());
    }

    /** Collapses every parent. Mirrors Syncfusion's `collapseAll`. */
    collapseAll(): void {
        this.collapsedIds.set(
            new Set(
                this.project()
                    .nodes.filter((n) => n.childIds.length)
                    .map((n) => n.id)
            )
        );
    }

    private setDayWidth(width: number): void {
        const el = this.scroller().nativeElement;
        const before = this.dayWidth();
        const centerDay = this.range().from + (el.scrollLeft + (el.clientWidth - this.gridWidth()) / 2) / before;

        this.dayWidthOverride.set(Math.min(Math.max(width, 0.5), 160));

        if (this.browser) requestAnimationFrame(() => (el.scrollLeft = Math.max((centerDay - this.range().from) * this.dayWidth() - (el.clientWidth - this.gridWidth()) / 2, 0)));
    }

    /** Widens the days. Mirrors Syncfusion's `zoomIn`. */
    zoomIn(): void {
        const i = nearestZoom(this.dayWidth());
        const next = ZOOM_LEVELS[ZOOM_LEVELS[i].dayWidth > this.dayWidth() * 1.02 ? i : Math.min(i + 1, ZOOM_LEVELS.length - 1)];

        this.setDayWidth(next.dayWidth);
    }

    /** Narrows the days. Mirrors Syncfusion's `zoomOut`. */
    zoomOut(): void {
        const i = nearestZoom(this.dayWidth());
        const next = ZOOM_LEVELS[ZOOM_LEVELS[i].dayWidth < this.dayWidth() * 0.98 ? i : Math.max(i - 1, 0)];

        this.setDayWidth(next.dayWidth);
    }

    /** Fits the whole project in the width of the chart. Mirrors Syncfusion's `zoomToFit`. */
    zoomToFit(): void {
        const nodes = this.project().nodes;

        if (!nodes.length) return;

        const first = this.calendar().dayOf(Math.min(...nodes.map((n) => n.start)));
        const last = this.calendar().dayOf(Math.max(...nodes.map((n) => n.end)));
        const room = Math.max(this.viewportWidth() - this.gridWidth() - 6 - 24, 100);

        this.dayWidthOverride.set(Math.min(Math.max(room / (last - first + 1 + 14), 0.5), 160));

        if (this.browser) requestAnimationFrame(() => this.scrollToDay(first - 2));
    }

    private scrollToDay(day: Day): void {
        const el = this.scroller().nativeElement;

        el.scrollTo({ left: Math.max((day - this.range().from) * this.dayWidth(), 0), behavior: 'auto' });
    }

    /** Scrolls the chart to a task and selects it. Mirrors Syncfusion's `scrollToTask`. */
    scrollToTask(id: string): void {
        const index = this.rows().findIndex((r) => r.task.id === String(id));

        if (index < 0) return;

        const row = this.rows()[index];
        const el = this.scroller().nativeElement;

        this.select(index);

        if (!this.browser) return;

        el.scrollTo({ left: Math.max((row.node.start / this.calendar().slots - this.range().from) * this.dayWidth() - 40, 0), top: Math.max(index * this.rowHeight() - el.clientHeight / 2, 0), behavior: 'auto' });
    }

    /** Scrolls the chart to a date. */
    scrollToDate(date: Date | string): void {
        const day = parseDay(date);

        if (day !== null && this.browser) this.scrollToDay(day - 3);
    }

    /** Selects a row. Mirrors Syncfusion's `selectRow`. */
    selectRow(index: number): void {
        this.select(index);
    }

    /** Sets the width of the grid, in pixels or as a percentage. Mirrors Syncfusion's `setSplitterPosition`. */
    setSplitterPosition(position: string | number): void {
        const total = this.viewportWidth();
        const px = typeof position === 'number' ? position : position.endsWith('%') ? (parseFloat(position) / 100) * total : parseFloat(position);

        this.gridWidthOverride.set(this.clampGrid(px));
    }

    /** Measures the gantt again. Mirrors Syncfusion's `refresh`. */
    refresh(): void {
        const el = this.scroller().nativeElement;

        this.viewportWidth.set(Math.max(el.clientWidth, 320));
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Gantt, SharedModule],
    exports: [Gantt, SharedModule]
})
export class GanttModule {}
