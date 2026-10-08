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
    color: '{primary.300}'
};

export const pointer: GaugeTokenSections.Pointer = {
    color: '{primary.color}',
    // Material removes the global focus ring (focus.ring.width is 0 and its colour 'unset'), so the
    // tokens that point at it would leave this keyboard-focusable surface with no indicator. It gets an
    // explicit 2px ring instead.
    focusRingColor: '{primary.color}',
    focusRingWidth: '2px'
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
