import type { GanttDesignTokens, GanttTokenSections } from '@openng/optimus-ui-themes/types/gantt';

export const root: GanttTokenSections.Root = {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}'
};

export const header: GanttTokenSections.Header = {
    background: '{content.hover.background}',
    color: '{text.muted.color}',
    fontWeight: '600',
    borderColor: '{content.border.color}'
};

export const row: GanttTokenSections.Row = {
    selectedBackground: '{highlight.background}',
    selectedColor: '{highlight.color}',
    hoverBackground: '{content.hover.background}',
    borderColor: '{content.border.color}'
};

export const cell: GanttTokenSections.Cell = {
    padding: '0 0.5rem'
};

export const chart: GanttTokenSections.Chart = {
    lineColor: '{content.border.color}',
    shadeBackground: 'color-mix(in srgb, {content.hover.background} 70%, transparent)',
    todayColor: '{primary.color}',
    markerColor: '{orange.500}'
};

export const taskbar: GanttTokenSections.Taskbar = {
    background: '{primary.300}',
    progressBackground: '{primary.color}',
    borderRadius: '{border.radius.sm}',
    parentBackground: '{text.muted.color}',
    milestoneBackground: '{text.color}',
    criticalBackground: '{red.300}',
    criticalProgressBackground: '{red.500}',
    labelColor: '{primary.contrast.color}',
    baselineBackground: '{text.muted.color}'
};

export const link: GanttTokenSections.Link = {
    color: '{text.muted.color}',
    criticalColor: '{red.500}'
};

export const splitter: GanttTokenSections.Splitter = {
    background: '{content.border.color}',
    hoverBackground: '{primary.color}'
};

export const focus: GanttTokenSections.Focus = {
    ringColor: '{focus.ring.color}',
    ringWidth: '{focus.ring.width}'
};

export default {
    root,
    header,
    row,
    cell,
    chart,
    taskbar,
    link,
    splitter,
    focus
} satisfies GanttDesignTokens;
