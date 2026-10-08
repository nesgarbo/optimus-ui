import type { DashboardLayoutDesignTokens, DashboardLayoutTokenSections } from '@openng/optimus-ui-themes/types/dashboardlayout';

export const panel: DashboardLayoutTokenSections.Panel = {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    shadow: 'none',
    dragShadow: '{overlay.popover.shadow}'
};

export const header: DashboardLayoutTokenSections.Header = {
    background: '{content.hover.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    padding: '0.5rem 0.75rem',
    fontWeight: '600'
};

export const content: DashboardLayoutTokenSections.Content = {
    padding: '0.75rem'
};

export const placeholder: DashboardLayoutTokenSections.Placeholder = {
    background: 'color-mix(in srgb, {primary.color} 12%, transparent)',
    borderColor: '{primary.color}',
    borderRadius: '{content.border.radius}'
};

export const handle: DashboardLayoutTokenSections.Handle = {
    color: '{text.muted.color}'
};

export const focus: DashboardLayoutTokenSections.Focus = {
    // Material removes the global focus ring (focus.ring.width is 0 and its colour 'unset'), so the
    // tokens that point at it would leave this keyboard-focusable surface with no indicator. It gets an
    // explicit 2px ring instead.
    ringColor: '{primary.color}',
    ringWidth: '2px'
};

export default {
    panel,
    header,
    content,
    placeholder,
    handle,
    focus
} satisfies DashboardLayoutDesignTokens;
