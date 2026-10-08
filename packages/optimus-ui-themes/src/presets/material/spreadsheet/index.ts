import type { SpreadsheetDesignTokens, SpreadsheetTokenSections } from '@openng/optimus-ui-themes/types/spreadsheet';

export const root: SpreadsheetTokenSections.Root = {
    background: '{content.background}',
    borderColor: '{form.field.border.color}',
    borderRadius: '{form.field.border.radius}',
    height: '32rem',
    disabledOpacity: '0.6'
};

export const invalid: SpreadsheetTokenSections.Invalid = {
    borderColor: '{form.field.invalid.border.color}'
};

export default {
    root,
    invalid
} satisfies SpreadsheetDesignTokens;
