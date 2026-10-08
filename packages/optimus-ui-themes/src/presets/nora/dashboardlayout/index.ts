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
    ringColor: '{focus.ring.color}',
    ringWidth: '{focus.ring.width}'
};

export default {
    panel,
    header,
    content,
    placeholder,
    handle,
    focus
} satisfies DashboardLayoutDesignTokens;
