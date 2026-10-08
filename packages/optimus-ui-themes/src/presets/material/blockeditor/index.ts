import type { BlockEditorDesignTokens, BlockEditorTokenSections } from '@openng/optimus-ui-themes/types/blockeditor';

export const root: BlockEditorTokenSections.Root = {
    background: '{form.field.background}',
    color: '{form.field.color}',
    borderColor: '{form.field.border.color}',
    borderRadius: '{form.field.border.radius}',
    disabledOpacity: '0.6',
    minHeight: '12rem',
    padding: '1rem'
};

export const focus: BlockEditorTokenSections.Focus = {
    borderColor: '{form.field.focus.border.color}'
};

export const invalid: BlockEditorTokenSections.Invalid = {
    borderColor: '{form.field.invalid.border.color}'
};

export const placeholder: BlockEditorTokenSections.Placeholder = {
    color: '{form.field.placeholder.color}'
};

export const quote: BlockEditorTokenSections.Quote = {
    borderColor: '{content.border.color}'
};

export const code: BlockEditorTokenSections.Code = {
    background: '{content.hover.background}'
};

export const link: BlockEditorTokenSections.Link = {
    color: '{primary.color}'
};

export const overlay: BlockEditorTokenSections.Overlay = {
    background: '{overlay.popover.background}',
    shadow: '{overlay.popover.shadow}'
};

export const item: BlockEditorTokenSections.Item = {
    hoverBackground: '{content.hover.background}',
    activeBackground: '{primary.color}',
    activeColor: '{primary.contrast.color}'
};

export default {
    root,
    focus,
    invalid,
    placeholder,
    quote,
    code,
    link,
    overlay,
    item
} satisfies BlockEditorDesignTokens;
