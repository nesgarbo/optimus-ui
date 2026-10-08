/**
 *
 * Map Design Tokens
 *
 * @module map
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace MapTokenSections {
    interface Root {
        /**
         * Background of root, seen until the tiles arrive
         *
         * @designToken map.background
         */
        background?: string;
        /**
         * Color of the message shown when the map cannot start
         *
         * @designToken map.color
         */
        color?: string;
        /**
         * Border color of root
         *
         * @designToken map.border.color
         */
        borderColor?: string;
        /**
         * Border radius of root
         *
         * @designToken map.border.radius
         */
        borderRadius?: string;
        /**
         * Height of root
         *
         * @designToken map.height
         */
        height?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<MapDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Map Design Tokens_
 *
 * @group components
 * @module map
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface MapDesignTokens extends DesignTokens<MapDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: MapTokenSections.Root;
}
