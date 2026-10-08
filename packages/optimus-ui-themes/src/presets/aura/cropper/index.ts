import type { CropperDesignTokens, CropperTokenSections } from '@openng/optimus-ui-themes/types/cropper';

export const root: CropperTokenSections.Root = {
    background: '{surface.100}',
    borderColor: '{form.field.border.color}',
    borderRadius: '{form.field.border.radius}',
    height: '24rem',
    disabledOpacity: '0.6'
};

export const selection: CropperTokenSections.Selection = {
    color: '{primary.color}'
};

export const invalid: CropperTokenSections.Invalid = {
    borderColor: '{form.field.invalid.border.color}'
};

export default {
    root,
    selection,
    invalid
} satisfies CropperDesignTokens;
