/**
 *
 * Gantt Design Tokens
 *
 * @module gantt
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace GanttTokenSections {
    interface Root {
        /**
         * Background of the gantt
         *
         * @designToken gantt.background
         */
        background?: string;
        /**
         * Color of the text
         *
         * @designToken gantt.color
         */
        color?: string;
        /**
         * Border color of the gantt
         *
         * @designToken gantt.border.color
         */
        borderColor?: string;
        /**
         * Border radius of the gantt
         *
         * @designToken gantt.border.radius
         */
        borderRadius?: string;
    }

    interface Header {
        /**
         * Background of the headers
         *
         * @designToken gantt.header.background
         */
        background?: string;
        /**
         * Color of the headers
         *
         * @designToken gantt.header.color
         */
        color?: string;
        /**
         * Font weight of the headers
         *
         * @designToken gantt.header.font.weight
         */
        fontWeight?: string;
        /**
         * Border color of the headers
         *
         * @designToken gantt.header.border.color
         */
        borderColor?: string;
    }

    interface Row {
        /**
         * Background of the selected row
         *
         * @designToken gantt.row.selected.background
         */
        selectedBackground?: string;
        /**
         * Color of the selected row
         *
         * @designToken gantt.row.selected.color
         */
        selectedColor?: string;
        /**
         * Background of a row under the pointer
         *
         * @designToken gantt.row.hover.background
         */
        hoverBackground?: string;
        /**
         * Line between rows
         *
         * @designToken gantt.row.border.color
         */
        borderColor?: string;
    }

    interface Cell {
        /**
         * Padding of a cell
         *
         * @designToken gantt.cell.padding
         */
        padding?: string;
    }

    interface Chart {
        /**
         * Color of the vertical lines of the chart
         *
         * @designToken gantt.chart.line.color
         */
        lineColor?: string;
        /**
         * Background of days with no work
         *
         * @designToken gantt.chart.shade.background
         */
        shadeBackground?: string;
        /**
         * Color of the line of today
         *
         * @designToken gantt.chart.today.color
         */
        todayColor?: string;
        /**
         * Color of an event marker
         *
         * @designToken gantt.chart.marker.color
         */
        markerColor?: string;
    }

    interface Taskbar {
        /**
         * Background of a bar
         *
         * @designToken gantt.taskbar.background
         */
        background?: string;
        /**
         * Color of the finished part of a bar
         *
         * @designToken gantt.taskbar.progress.background
         */
        progressBackground?: string;
        /**
         * Border radius of a bar
         *
         * @designToken gantt.taskbar.border.radius
         */
        borderRadius?: string;
        /**
         * Background of the bar of a parent
         *
         * @designToken gantt.taskbar.parent.background
         */
        parentBackground?: string;
        /**
         * Color of a milestone
         *
         * @designToken gantt.taskbar.milestone.background
         */
        milestoneBackground?: string;
        /**
         * Background of a bar on the critical path
         *
         * @designToken gantt.taskbar.critical.background
         */
        criticalBackground?: string;
        /**
         * Finished part of a bar on the critical path
         *
         * @designToken gantt.taskbar.critical.progress.background
         */
        criticalProgressBackground?: string;
        /**
         * Color of the text inside a bar
         *
         * @designToken gantt.taskbar.label.color
         */
        labelColor?: string;
        /**
         * Color of the plan drawn under a bar
         *
         * @designToken gantt.taskbar.baseline.background
         */
        baselineBackground?: string;
    }

    interface Link {
        /**
         * Color of a dependency line
         *
         * @designToken gantt.link.color
         */
        color?: string;
        /**
         * Color of a dependency line on the critical path
         *
         * @designToken gantt.link.critical.color
         */
        criticalColor?: string;
    }

    interface Splitter {
        /**
         * Background of the splitter
         *
         * @designToken gantt.splitter.background
         */
        background?: string;
        /**
         * Background of the splitter under the pointer
         *
         * @designToken gantt.splitter.hover.background
         */
        hoverBackground?: string;
    }

    interface Focus {
        /**
         * Color of the focus ring
         *
         * @designToken gantt.focus.ring.color
         */
        ringColor?: string;
        /**
         * Width of the focus ring
         *
         * @designToken gantt.focus.ring.width
         */
        ringWidth?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<GanttDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Gantt Design Tokens_
 *
 * @group components
 * @module gantt
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface GanttDesignTokens extends DesignTokens<GanttDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: GanttTokenSections.Root;
    /**
     * Used to pass tokens of the header section
     */
    header?: GanttTokenSections.Header;
    /**
     * Used to pass tokens of the row section
     */
    row?: GanttTokenSections.Row;
    /**
     * Used to pass tokens of the cell section
     */
    cell?: GanttTokenSections.Cell;
    /**
     * Used to pass tokens of the chart section
     */
    chart?: GanttTokenSections.Chart;
    /**
     * Used to pass tokens of the taskbar section
     */
    taskbar?: GanttTokenSections.Taskbar;
    /**
     * Used to pass tokens of the link section
     */
    link?: GanttTokenSections.Link;
    /**
     * Used to pass tokens of the splitter section
     */
    splitter?: GanttTokenSections.Splitter;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: GanttTokenSections.Focus;
}
