/**
 *
 * Cropper Design Tokens
 *
 * @module cropper
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace CropperTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken cropper.background
         */
        background?: string;
        /**
         * Border color of root
         *
         * @designToken cropper.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken cropper.border.radius
         */
        borderRadius?: string;
        /**
         * Height of root
         *
         * @designToken cropper.height
         */
        height?: string;
        /**
         * Opacity of root while disabled
         *
         * @designToken cropper.disabled.opacity
         */
        disabledOpacity?: string;
    }

    interface Selection {
        /**
         * Color of the crop box and its handles
         *
         * @designToken cropper.selection.color
         */
        color?: string;
    }

    interface Invalid {
        /**
         * Border color of root while invalid
         *
         * @designToken cropper.invalid.border.color
         */
        borderColor?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<CropperDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Cropper Design Tokens_
 *
 * @group components
 * @module cropper
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface CropperDesignTokens extends DesignTokens<CropperDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: CropperTokenSections.Root;
    /**
     * Used to pass tokens of the selection section
     */
    selection?: CropperTokenSections.Selection;
    /**
     * Used to pass tokens of the invalid section
     */
    invalid?: CropperTokenSections.Invalid;
}
