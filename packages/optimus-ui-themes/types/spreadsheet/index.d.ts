/**
 *
 * Spreadsheet Design Tokens
 *
 * @module spreadsheet
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace SpreadsheetTokenSections {
    interface Root {
        /**
         * Background of root, seen until the sheet is drawn
         *
         * @designToken spreadsheet.background
         */
        background?: string;
        /**
         * Border color of root
         *
         * @designToken spreadsheet.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken spreadsheet.border.radius
         */
        borderRadius?: string;
        /**
         * Height of root
         *
         * @designToken spreadsheet.height
         */
        height?: string;
        /**
         * Opacity of root while disabled
         *
         * @designToken spreadsheet.disabled.opacity
         */
        disabledOpacity?: string;
    }

    interface Invalid {
        /**
         * Border color of root while invalid
         *
         * @designToken spreadsheet.invalid.border.color
         */
        borderColor?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<SpreadsheetDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Spreadsheet Design Tokens_
 *
 * @group components
 * @module spreadsheet
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface SpreadsheetDesignTokens extends DesignTokens<SpreadsheetDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: SpreadsheetTokenSections.Root;
    /**
     * Used to pass tokens of the invalid section
     */
    invalid?: SpreadsheetTokenSections.Invalid;
}
