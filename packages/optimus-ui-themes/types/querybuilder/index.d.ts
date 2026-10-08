/**
 *
 * QueryBuilder Design Tokens
 *
 * @module querybuilder
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace QueryBuilderTokenSections {
    interface Root {
        /**
         * Background of root
         *
         * @designToken querybuilder.background
         */
        background?: string;
        /**
         * Color of root
         *
         * @designToken querybuilder.color
         */
        color?: string;
        /**
         * Gap between the parts of root
         *
         * @designToken querybuilder.gap
         */
        gap?: string;
    }

    interface Group {
        /**
         * Background of a group
         *
         * @designToken querybuilder.group.background
         */
        background?: string;
        /**
         * Border color of a group
         *
         * @designToken querybuilder.group.border.color
         */
        borderColor?: string;
        /**
         * Border radius of a group
         *
         * @designToken querybuilder.group.border.radius
         */
        borderRadius?: string;
        /**
         * Padding of a group
         *
         * @designToken querybuilder.group.padding
         */
        padding?: string;
        /**
         * Gap between the children of a group
         *
         * @designToken querybuilder.group.gap
         */
        gap?: string;
    }

    interface Header {
        /**
         * Gap between the controls of a group header
         *
         * @designToken querybuilder.header.gap
         */
        gap?: string;
    }

    interface Rule {
        /**
         * Gap between the parts of a condition
         *
         * @designToken querybuilder.rule.gap
         */
        gap?: string;
        /**
         * Padding of a condition
         *
         * @designToken querybuilder.rule.padding
         */
        padding?: string;
    }

    interface Error {
        /**
         * Color of a validation message
         *
         * @designToken querybuilder.error.color
         */
        color?: string;
        /**
         * Font size of a validation message
         *
         * @designToken querybuilder.error.font.size
         */
        fontSize?: string;
    }

    interface Empty {
        /**
         * Color of the empty-group hint
         *
         * @designToken querybuilder.empty.color
         */
        color?: string;
        /**
         * Padding of the empty-group hint
         *
         * @designToken querybuilder.empty.padding
         */
        padding?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<QueryBuilderDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _QueryBuilder Design Tokens_
 *
 * @group components
 * @module querybuilder
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface QueryBuilderDesignTokens extends DesignTokens<QueryBuilderDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: QueryBuilderTokenSections.Root;
    /**
     * Used to pass tokens of the group section
     */
    group?: QueryBuilderTokenSections.Group;
    /**
     * Used to pass tokens of the header section
     */
    header?: QueryBuilderTokenSections.Header;
    /**
     * Used to pass tokens of the rule section
     */
    rule?: QueryBuilderTokenSections.Rule;
    /**
     * Used to pass tokens of the error section
     */
    error?: QueryBuilderTokenSections.Error;
    /**
     * Used to pass tokens of the empty section
     */
    empty?: QueryBuilderTokenSections.Empty;
}
