/**
 *
 * Gauge Design Tokens
 *
 * @module gauge
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace GaugeTokenSections {
    interface Root {
        /**
         * Color of text on the gauge
         *
         * @designToken gauge.color
         */
        color?: string;
        /**
         * Font of the labels
         *
         * @designToken gauge.font.family
         */
        fontFamily?: string;
    }

    interface Title {
        /**
         * Color of the title
         *
         * @designToken gauge.title.color
         */
        color?: string;
        /**
         * Font size of the title
         *
         * @designToken gauge.title.font.size
         */
        fontSize?: string;
        /**
         * Font weight of the title
         *
         * @designToken gauge.title.font.weight
         */
        fontWeight?: string;
        /**
         * Space under the title
         *
         * @designToken gauge.title.padding
         */
        padding?: string;
    }

    interface Line {
        /**
         * Color of an axis line
         *
         * @designToken gauge.line.color
         */
        color?: string;
    }

    interface Tick {
        /**
         * Color of a tick
         *
         * @designToken gauge.tick.color
         */
        color?: string;
    }

    interface Label {
        /**
         * Color of a label
         *
         * @designToken gauge.label.color
         */
        color?: string;
    }

    interface Range {
        /**
         * Color of a range that sets none
         *
         * @designToken gauge.range.color
         */
        color?: string;
    }

    interface Pointer {
        /**
         * Color of a pointer that sets none
         *
         * @designToken gauge.pointer.color
         */
        color?: string;
        /**
         * Color of the focus ring of an interactive gauge
         *
         * @designToken gauge.pointer.focus.ring.color
         */
        focusRingColor?: string;
        /**
         * Width of the focus ring
         *
         * @designToken gauge.pointer.focus.ring.width
         */
        focusRingWidth?: string;
    }

    interface Container {
        /**
         * Background of a linear gauge container
         *
         * @designToken gauge.container.background
         */
        background?: string;
        /**
         * Border color of a linear gauge container
         *
         * @designToken gauge.container.border.color
         */
        borderColor?: string;
    }

    interface Annotation {
        /**
         * Color of an annotation
         *
         * @designToken gauge.annotation.color
         */
        color?: string;
        /**
         * Font size of an annotation
         *
         * @designToken gauge.annotation.font.size
         */
        fontSize?: string;
        /**
         * Font weight of an annotation
         *
         * @designToken gauge.annotation.font.weight
         */
        fontWeight?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<GaugeDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _Gauge Design Tokens_
 *
 * @group components
 * @module gauge
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface GaugeDesignTokens extends DesignTokens<GaugeDesignTokens> {
    /**
     * Used to pass tokens of the root section
     */
    root?: GaugeTokenSections.Root;
    /**
     * Used to pass tokens of the title section
     */
    title?: GaugeTokenSections.Title;
    /**
     * Used to pass tokens of the line section
     */
    line?: GaugeTokenSections.Line;
    /**
     * Used to pass tokens of the tick section
     */
    tick?: GaugeTokenSections.Tick;
    /**
     * Used to pass tokens of the label section
     */
    label?: GaugeTokenSections.Label;
    /**
     * Used to pass tokens of the range section
     */
    range?: GaugeTokenSections.Range;
    /**
     * Used to pass tokens of the pointer section
     */
    pointer?: GaugeTokenSections.Pointer;
    /**
     * Used to pass tokens of the container section
     */
    container?: GaugeTokenSections.Container;
    /**
     * Used to pass tokens of the annotation section
     */
    annotation?: GaugeTokenSections.Annotation;
}
