import type { SignatureDesignTokens, SignatureTokenSections } from '@openng/optimus-ui-themes/types/signature';

export const root: SignatureTokenSections.Root = {
    background: '{form.field.background}',
    color: '{form.field.color}',
    borderColor: '{form.field.border.color}',
    borderRadius: '{form.field.border.radius}',
    height: '12rem',
    disabledOpacity: '0.6'
};

export const focus: SignatureTokenSections.Focus = {
    borderColor: '{form.field.focus.border.color}'
};

export const invalid: SignatureTokenSections.Invalid = {
    borderColor: '{form.field.invalid.border.color}'
};

export default {
    root,
    focus,
    invalid
} satisfies SignatureDesignTokens;
