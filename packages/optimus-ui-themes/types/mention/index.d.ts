/**
 *
 * Mention Design Tokens
 *
 * @module mention
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace MentionTokenSections {
    interface Root {
        /**
         * Background of the list
         *
         * @designToken mention.background
         */
        background?: string;
        /**
         * Color of the list
         *
         * @designToken mention.color
         */
        color?: string;
        /**
         * Border color of the list
         *
         * @designToken mention.border.color
         */
        borderColor?: string;
        /**
         * Border radius of the list
         *
         * @designToken mention.border.radius
         */
        borderRadius?: string;
        /**
         * Shadow of the list
         *
         * @designToken mention.shadow
         */
        shadow?: string;
        /**
         * Padding of the list
         *
         * @designToken mention.padding
         */
        padding?: string;
        /**
         * Gap between the rows
         *
         * @designToken mention.gap
         */
        gap?: string;
    }

    interface Item {
        /**
         * Background of the highlighted row
         *
         * @designToken mention.item.focus.background
         */
        focusBackground?: string;
        /**
         * Color of the highlighted row
         *
         * @designToken mention.item.focus.color
         */
        focusColor?: string;
        /**
         * Padding of a row
         *
         * @designToken mention.item.padding
         */
        padding?: string;
        /**
         * Border radius of a row
         *
         * @designToken mention.item.border.radius
         */
        borderRadius?: string;
        /**
         * Gap between the icon and the text of a row
         *
         * @designToken mention.item.gap
         */
        gap?: string;
    }

    interface Group {
        /**
         * Color of a group heading
         *
         * @designToken mention.group.color
         */
        color?: string;
        /**
         * Font weight of a group heading
         *
         * @designToken mention.group.font.weight
         */
        fontWeight?: string;
        /**
         * Padding of a group heading
         *
         * @designToken mention.group.padding
         */
        padding?: string;
    }

    interface Empty {
        /**
         * Color of the no-records text
         *
         * @designToken mention.empty.color
         */
        color?: string;
        /**
         * Padding of the no-records text
         *
         * @designToken mention.empty.padding
         */
        padding?: string;
    }

    interface Chip {
        /**
         * Background of the inserted chip
         *
         * @designToken mention.chip.background
         */
        background?: string;
        /**
         * Color of the inserted chip
         *
         * @designToken mention.chip.color
         */
        color?: string;
        /**
         * Border radius of the inserted chip
         *
         * @designToken mention.chip.border.radius
         */
        borderRadius?: string;
        /**
         * Padding of the inserted chip
         *
         * @designToken mention.chip.padding
         */
        padding?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<MentionDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Mention Design Tokens_
 *
 * @group components
 * @module mention
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface MentionDesignTokens extends DesignTokens<MentionDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: MentionTokenSections.Root;
    /**
     * Used to pass tokens of the item section
     */
    item?: MentionTokenSections.Item;
    /**
     * Used to pass tokens of the group section
     */
    group?: MentionTokenSections.Group;
    /**
     * Used to pass tokens of the empty section
     */
    empty?: MentionTokenSections.Empty;
    /**
     * Used to pass tokens of the chip section
     */
    chip?: MentionTokenSections.Chip;
}
