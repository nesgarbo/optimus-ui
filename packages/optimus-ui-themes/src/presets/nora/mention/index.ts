import type { MentionDesignTokens, MentionTokenSections } from '@openng/optimus-ui-themes/types/mention';

export const root: MentionTokenSections.Root = {
    background: '{overlay.select.background}',
    color: '{overlay.select.color}',
    borderColor: '{overlay.select.border.color}',
    borderRadius: '{overlay.select.border.radius}',
    shadow: '{overlay.select.shadow}',
    padding: '{list.padding}',
    gap: '{list.gap}'
};

export const item: MentionTokenSections.Item = {
    focusBackground: '{list.option.focus.background}',
    focusColor: '{list.option.focus.color}',
    padding: '{list.option.padding}',
    borderRadius: '{list.option.border.radius}',
    gap: '0.5rem'
};

export const group: MentionTokenSections.Group = {
    color: '{list.option.group.color}',
    fontWeight: '{list.option.group.font.weight}',
    padding: '{list.option.group.padding}'
};

export const empty: MentionTokenSections.Empty = {
    color: '{text.muted.color}',
    padding: '{list.option.padding}'
};

export const chip: MentionTokenSections.Chip = {
    background: '{highlight.background}',
    color: '{highlight.color}',
    borderRadius: '{border.radius.sm}',
    padding: '0 0.25rem'
};

export default {
    root,
    item,
    group,
    empty,
    chip
} satisfies MentionDesignTokens;
