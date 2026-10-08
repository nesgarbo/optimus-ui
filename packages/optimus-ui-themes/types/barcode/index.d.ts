/**
 *
 * Barcode Design Tokens
 *
 * @module barcode
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace BarcodeTokenSections {
    interface Root {
        /**
         * Border radius of the symbol box
         *
         * @designToken barcode.border.radius
         */
        borderRadius?: string;
        /**
         * Outline color of the box while the value cannot be written
         *
         * @designToken barcode.invalid.border.color
         */
        invalidBorderColor?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<BarcodeDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Barcode Design Tokens_
 *
 * @group components
 * @module barcode
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface BarcodeDesignTokens extends DesignTokens<BarcodeDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: BarcodeTokenSections.Root;
}
