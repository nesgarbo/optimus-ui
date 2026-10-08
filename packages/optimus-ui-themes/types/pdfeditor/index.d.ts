/**
 *
 * PdfEditor Design Tokens
 *
 * @module pdfeditor
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace PdfEditorTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken pdfeditor.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken pdfeditor.color
         */
        color?: string;
        /**
         * Border color of root and its dividers
         *
         * @designToken pdfeditor.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken pdfeditor.border.radius
         */
        borderRadius?: string;
        /**
         * Height of root
         *
         * @designToken pdfeditor.height
         */
        height?: string;
    }

    interface Toolbar {
        /**
         * Background of the toolbar and the sidebar
         *
         * @designToken pdfeditor.toolbar.background
         */
        background?: string;
        /**
         * Gap between the buttons of the toolbar
         *
         * @designToken pdfeditor.toolbar.gap
         */
        gap?: string;
        /**
         * Padding of the toolbar
         *
         * @designToken pdfeditor.toolbar.padding
         */
        padding?: string;
    }

    interface Button {
        /**
         * Border radius of a button
         *
         * @designToken pdfeditor.button.border.radius
         */
        borderRadius?: string;
        /**
         * Background of a button on hover
         *
         * @designToken pdfeditor.button.hover.background
         */
        hoverBackground?: string;
        /**
         * Background of the tool that is on
         *
         * @designToken pdfeditor.button.active.background
         */
        activeBackground?: string;
        /**
         * Color of the tool that is on
         *
         * @designToken pdfeditor.button.active.color
         */
        activeColor?: string;
    }

    interface Sidebar {
        /**
         * Width of the sidebar of thumbnails
         *
         * @designToken pdfeditor.sidebar.width
         */
        width?: string;
    }

    interface Stage {
        /**
         * Background around the page
         *
         * @designToken pdfeditor.stage.background
         */
        background?: string;
    }

    interface Selection {
        /**
         * Color of the selection, its handles and the focus rings
         *
         * @designToken pdfeditor.selection.color
         */
        color?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<PdfEditorDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _PdfEditor Design Tokens_
 *
 * @group components
 * @module pdfeditor
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface PdfEditorDesignTokens extends DesignTokens<PdfEditorDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: PdfEditorTokenSections.Root;
    /**
     * Used to pass tokens of the toolbar section
     */
    toolbar?: PdfEditorTokenSections.Toolbar;
    /**
     * Used to pass tokens of the button section
     */
    button?: PdfEditorTokenSections.Button;
    /**
     * Used to pass tokens of the sidebar section
     */
    sidebar?: PdfEditorTokenSections.Sidebar;
    /**
     * Used to pass tokens of the stage section
     */
    stage?: PdfEditorTokenSections.Stage;
    /**
     * Used to pass tokens of the selection section
     */
    selection?: PdfEditorTokenSections.Selection;
}
