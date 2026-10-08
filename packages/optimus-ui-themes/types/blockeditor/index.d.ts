/**
 *
 * BlockEditor Design Tokens
 *
 * @module blockeditor
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace BlockEditorTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken blockeditor.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken blockeditor.color
         */
        color?: string;
        /**
         * Border color of root
         *
         * @designToken blockeditor.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken blockeditor.border.radius
         */
        borderRadius?: string;
        /**
         * Opacity of root while disabled
         *
         * @designToken blockeditor.disabled.opacity
         */
        disabledOpacity?: string;
        /**
         * Least height of the document
         *
         * @designToken blockeditor.min.height
         */
        minHeight?: string;
        /**
         * Padding of the document
         *
         * @designToken blockeditor.padding
         */
        padding?: string;
    }

    interface Focus {
        /**
         * Border color of root while focused
         *
         * @designToken blockeditor.focus.border.color
         */
        borderColor?: string;
    }

    interface Invalid {
        /**
         * Border color of root while invalid
         *
         * @designToken blockeditor.invalid.border.color
         */
        borderColor?: string;
    }

    interface Placeholder {
        /**
         * Color of the placeholder
         *
         * @designToken blockeditor.placeholder.color
         */
        color?: string;
    }

    interface Quote {
        /**
         * Color of the bar of a quote
         *
         * @designToken blockeditor.quote.border.color
         */
        borderColor?: string;
    }

    interface Code {
        /**
         * Background of code
         *
         * @designToken blockeditor.code.background
         */
        background?: string;
    }

    interface Link {
        /**
         * Color of a link
         *
         * @designToken blockeditor.link.color
         */
        color?: string;
    }

    interface Overlay {
        /**
         * Background of the slash menu and the toolbar over a selection
         *
         * @designToken blockeditor.overlay.background
         */
        background?: string;
        /**
         * Shadow of the slash menu and the toolbar over a selection
         *
         * @designToken blockeditor.overlay.shadow
         */
        shadow?: string;
    }

    interface Item {
        /**
         * Background of an entry on hover
         *
         * @designToken blockeditor.item.hover.background
         */
        hoverBackground?: string;
        /**
         * Background of a button that is on
         *
         * @designToken blockeditor.item.active.background
         */
        activeBackground?: string;
        /**
         * Color of a button that is on
         *
         * @designToken blockeditor.item.active.color
         */
        activeColor?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<BlockEditorDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _BlockEditor Design Tokens_
 *
 * @group components
 * @module blockeditor
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface BlockEditorDesignTokens extends DesignTokens<BlockEditorDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: BlockEditorTokenSections.Root;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: BlockEditorTokenSections.Focus;
    /**
     * Used to pass tokens of the invalid section
     */
    invalid?: BlockEditorTokenSections.Invalid;
    /**
     * Used to pass tokens of the placeholder section
     */
    placeholder?: BlockEditorTokenSections.Placeholder;
    /**
     * Used to pass tokens of the quote section
     */
    quote?: BlockEditorTokenSections.Quote;
    /**
     * Used to pass tokens of the code section
     */
    code?: BlockEditorTokenSections.Code;
    /**
     * Used to pass tokens of the link section
     */
    link?: BlockEditorTokenSections.Link;
    /**
     * Used to pass tokens of the overlay section
     */
    overlay?: BlockEditorTokenSections.Overlay;
    /**
     * Used to pass tokens of the item section
     */
    item?: BlockEditorTokenSections.Item;
}
