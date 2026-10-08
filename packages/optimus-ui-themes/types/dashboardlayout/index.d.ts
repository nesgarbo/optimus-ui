/**
 *
 * DashboardLayout Design Tokens
 *
 * @module dashboardlayout
 *
 */

import type { ColorScheme as CS, DesignTokens, ExtendedCSS, ExtendedTokens } from '..';

/**
 * Design Token Sections
 */
export declare namespace DashboardLayoutTokenSections {
    interface Panel {
        /**
         * Background of a panel
         *
         * @designToken dashboardlayout.panel.background
         */
        background?: string;
        /**
         * Color of a panel
         *
         * @designToken dashboardlayout.panel.color
         */
        color?: string;
        /**
         * Border color of a panel
         *
         * @designToken dashboardlayout.panel.border.color
         */
        borderColor?: string;
        /**
         * Border radius of a panel
         *
         * @designToken dashboardlayout.panel.border.radius
         */
        borderRadius?: string;
        /**
         * Shadow of a panel at rest
         *
         * @designToken dashboardlayout.panel.shadow
         */
        shadow?: string;
        /**
         * Shadow of a panel while it is dragged
         *
         * @designToken dashboardlayout.panel.drag.shadow
         */
        dragShadow?: string;
    }

    interface Header {
        /**
         * Background of a panel header
         *
         * @designToken dashboardlayout.header.background
         */
        background?: string;
        /**
         * Color of a panel header
         *
         * @designToken dashboardlayout.header.color
         */
        color?: string;
        /**
         * Border color under a panel header
         *
         * @designToken dashboardlayout.header.border.color
         */
        borderColor?: string;
        /**
         * Padding of a panel header
         *
         * @designToken dashboardlayout.header.padding
         */
        padding?: string;
        /**
         * Font weight of a panel header
         *
         * @designToken dashboardlayout.header.font.weight
         */
        fontWeight?: string;
    }

    interface Content {
        /**
         * Padding of a panel body
         *
         * @designToken dashboardlayout.content.padding
         */
        padding?: string;
    }

    interface Placeholder {
        /**
         * Background of the drop placeholder
         *
         * @designToken dashboardlayout.placeholder.background
         */
        background?: string;
        /**
         * Border color of the drop placeholder
         *
         * @designToken dashboardlayout.placeholder.border.color
         */
        borderColor?: string;
        /**
         * Border radius of the drop placeholder
         *
         * @designToken dashboardlayout.placeholder.border.radius
         */
        borderRadius?: string;
    }

    interface Handle {
        /**
         * Color of the resize corner mark
         *
         * @designToken dashboardlayout.handle.color
         */
        color?: string;
    }

    interface Focus {
        /**
         * Color of the focus ring of a panel
         *
         * @designToken dashboardlayout.focus.ring.color
         */
        ringColor?: string;
        /**
         * Width of the focus ring of a panel
         *
         * @designToken dashboardlayout.focus.ring.width
         */
        ringWidth?: string;
    }

    /* Static Sections */
    type ColorScheme = CS<DashboardLayoutDesignTokens>;
    type CSS = ExtendedCSS;
    type Extend = ExtendedTokens;
}

/**
 *
 * _DashboardLayout Design Tokens_
 *
 * @group components
 * @module dashboardlayout
 * @see
 * --- ---
 * **Compatible Libraries**
 *
 * [Optimus UI](https://optimus.openng.org/theming/styled)
 *
 */
export interface DashboardLayoutDesignTokens extends DesignTokens<DashboardLayoutDesignTokens> {
    /**
     * Used to pass tokens of the panel section
     */
    panel?: DashboardLayoutTokenSections.Panel;
    /**
     * Used to pass tokens of the header section
     */
    header?: DashboardLayoutTokenSections.Header;
    /**
     * Used to pass tokens of the content section
     */
    content?: DashboardLayoutTokenSections.Content;
    /**
     * Used to pass tokens of the placeholder section
     */
    placeholder?: DashboardLayoutTokenSections.Placeholder;
    /**
     * Used to pass tokens of the handle section
     */
    handle?: DashboardLayoutTokenSections.Handle;
    /**
     * Used to pass tokens of the focus section
     */
    focus?: DashboardLayoutTokenSections.Focus;
}
