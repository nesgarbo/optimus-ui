/**
 *
 * Signature Design Tokens
 *
 * @module signature
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace SignatureTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken signature.background
         */
        background?: string;
        /**
         * Color of the pen, when no stroke color is set
         *
         * @designToken signature.color
         */
        color?: string;
        /**
         * Border color of root
         *
         * @designToken signature.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken signature.border.radius
         */
        borderRadius?: string;
        /**
         * Height of root
         *
         * @designToken signature.height
         */
        height?: string;
        /**
         * Opacity of root while disabled
         *
         * @designToken signature.disabled.opacity
         */
        disabledOpacity?: string;
    }

    interface Focus {
        /**
         * Border color of root while focused
         *
         * @designToken signature.focus.border.color
         */
        borderColor?: string;
    }

    interface Invalid {
        /**
         * Border color of root while invalid
         *
         * @designToken signature.invalid.border.color
         */
        borderColor?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<SignatureDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Signature Design Tokens_
 *
 * @group components
 * @module signature
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface SignatureDesignTokens extends DesignTokens<SignatureDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: SignatureTokenSections.Root;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: SignatureTokenSections.Focus;
    /**
     * Used to pass tokens of the invalid section
     */
    invalid?: SignatureTokenSections.Invalid;
}
