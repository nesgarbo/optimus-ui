import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/gantt';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => ['p-gantt p-component', { 'p-gantt-editable': instance.canEditBars(), 'p-gantt-busy': instance.busy() }],
    scroll: 'p-gantt-scroll',
    head: 'p-gantt-head',
    gridHead: 'p-gantt-grid-head',
    chartHead: 'p-gantt-chart-head',
    tier: 'p-gantt-tier',
    tierCell: 'p-gantt-tier-cell',
    grid: 'p-gantt-grid',
    row: ({ instance, row }) => ['p-gantt-row', { 'p-gantt-row-selected': row.selected, 'p-gantt-row-parent': row.task.isParent, 'p-gantt-row-critical': row.task.isCritical && instance.enableCriticalPath() }],
    cell: 'p-gantt-cell',
    toggle: 'p-gantt-toggle',
    splitter: 'p-gantt-splitter',
    chart: 'p-gantt-chart',
    shade: 'p-gantt-shade',
    line: 'p-gantt-line',
    today: 'p-gantt-today',
    marker: 'p-gantt-marker',
    taskbar: ({ bar }) => [
        'p-gantt-taskbar',
        {
            'p-gantt-taskbar-parent': bar.isParent,
            'p-gantt-taskbar-milestone': bar.isMilestone,
            'p-gantt-taskbar-critical': bar.critical,
            'p-gantt-taskbar-overallocated': bar.overallocated,
            'p-gantt-taskbar-selected': bar.selected,
            'p-gantt-taskbar-dragging': bar.dragging
        }
    ],
    progress: 'p-gantt-progress',
    handle: ({ side }) => ['p-gantt-handle', `p-gantt-handle-${side}`],
    label: ({ side }) => ['p-gantt-label', `p-gantt-label-${side}`],
    links: 'p-gantt-links',
    link: ({ link }) => ['p-gantt-link', { 'p-gantt-link-critical': link.critical }]
};

@Injectable()
export class GanttStyle extends BaseStyle {
    name = 'gantt';

    style = style;

    classes = classes;
}

/**
 *
 * Gantt plans tasks on a timeline: a grid of tasks beside a chart of bars, with dependencies, a working calendar, a critical path and editing.
 *
 * [Live Demo](https://optimus.openng.org/gantt/)
 *
 * @module ganttstyle
 *
 */
export enum GanttClasses {
    /** Class name of the root element */
    root = 'p-gantt',
    /** Class name of the grid of tasks */
    grid = 'p-gantt-grid',
    /** Class name of a row of the grid */
    row = 'p-gantt-row',
    /** Class name of the chart */
    chart = 'p-gantt-chart',
    /** Class name of the bar of a task */
    taskbar = 'p-gantt-taskbar',
    /** Class name of the filled part of a bar */
    progress = 'p-gantt-progress',
    /** Class name of a dependency line */
    link = 'p-gantt-link'
}

export interface GanttStyle {
    /** Used to pass tokens of the component */
    name: string;
}
