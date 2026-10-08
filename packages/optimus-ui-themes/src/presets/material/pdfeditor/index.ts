import type { PdfEditorDesignTokens, PdfEditorTokenSections } from '@openng/optimus-ui-themes/types/pdfeditor';

export const root: PdfEditorTokenSections.Root = {
    background: '{content.background}',
    color: '{text.color}',
    borderColor: '{content.border.color}',
    borderRadius: '{content.border.radius}',
    height: '40rem'
};

export const toolbar: PdfEditorTokenSections.Toolbar = {
    background: '{content.background}',
    gap: '0.375rem',
    padding: '0.5rem'
};

export const button: PdfEditorTokenSections.Button = {
    borderRadius: '{border.radius.sm}',
    hoverBackground: '{content.hover.background}',
    activeBackground: '{primary.color}',
    activeColor: '{primary.contrast.color}'
};

export const sidebar: PdfEditorTokenSections.Sidebar = {
    width: '9rem'
};

export const stage: PdfEditorTokenSections.Stage = {
    background: '{content.hover.background}'
};

export const selection: PdfEditorTokenSections.Selection = {
    color: '{primary.color}'
};

export default {
    root,
    toolbar,
    button,
    sidebar,
    stage,
    selection
} satisfies PdfEditorDesignTokens;
