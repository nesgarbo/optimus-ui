import type { GaugeDesignTokens, GaugeTokenSections } from '@openng/optimus-ui-themes/types/gauge';

export const root: GaugeTokenSections.Root = {
    color: '{content.color}',
    fontFamily: 'inherit'
};

export const title: GaugeTokenSections.Title = {
    color: '{text.color}',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0 0 0.5rem 0'
};

export const line: GaugeTokenSections.Line = {
    color: '{content.border.color}'
};

export const tick: GaugeTokenSections.Tick = {
    color: '{text.muted.color}'
};

export const label: GaugeTokenSections.Label = {
    color: '{text.muted.color}'
};

export const range: GaugeTokenSections.Range = {
    color: '{primary.200}'
};

export const pointer: GaugeTokenSections.Pointer = {
    color: '{primary.color}',
    focusRingColor: '{focus.ring.color}',
    focusRingWidth: '{focus.ring.width}'
};

export const container: GaugeTokenSections.Container = {
    background: '{content.hover.background}',
    borderColor: '{content.border.color}'
};

export const annotation: GaugeTokenSections.Annotation = {
    color: '{text.color}',
    fontSize: '1.25rem',
    fontWeight: '600'
};

export default {
    root,
    title,
    line,
    tick,
    label,
    range,
    pointer,
    container,
    annotation
} satisfies GaugeDesignTokens;
