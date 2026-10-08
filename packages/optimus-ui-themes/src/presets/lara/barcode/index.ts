import type { BarcodeDesignTokens, BarcodeTokenSections } from '@openng/optimus-ui-themes/types/barcode';

export const root: BarcodeTokenSections.Root = {
    borderRadius: '{border.radius.sm}',
    invalidBorderColor: '{form.field.invalid.border.color}'
};

export default {
    root
} satisfies BarcodeDesignTokens;
