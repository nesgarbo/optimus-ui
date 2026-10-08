import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * One tile of the dashboard.
 * @group Types
 */
export interface PanelModel {
    /** Identity of the panel. Must be unique. */
    id: string;
    /** Row of the top edge, from 0. */
    row: number;
    /** Column of the left edge, from 0. */
    col: number;
    /** Width in columns. Defaults to 1. */
    sizeX?: number;
    /** Height in rows. Defaults to 1. */
    sizeY?: number;
    /** Narrowest the panel gets, in columns. */
    minSizeX?: number;
    /** Shortest the panel gets, in rows. */
    minSizeY?: number;
    /** Widest the panel gets, in columns. */
    maxSizeX?: number;
    /** Tallest the panel gets, in rows. */
    maxSizeY?: number;
    /** Stacking order. */
    zIndex?: number;
    /** Header text, when no `#header` template is given. */
    header?: string;
    /** Body text, when no `#panel` template is given. */
    content?: string;
    /** Extra CSS classes on the panel. */
    cssClass?: string;
    /** Set to `false` to keep this panel where it is. */
    enabled?: boolean;
    /** Anything the application wants to carry; handed back in the template context. */
    data?: any;
}

/**
 * The edges a panel can be resized from. `se` is the bottom right corner.
 * @group Types
 */
export type DashboardResizeHandle = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/**
 * Event of the drag and resize events.
 * @group Events
 */
export interface DashboardInteractionEvent {
    /** The panel, with the position or size it has now. */
    panel: PanelModel;
    /** The pointer event or the keyboard event behind it. */
    originalEvent: Event;
    /** Set to `true` on a `*Start` event to cancel the interaction. */
    cancel: boolean;
}

/**
 * Event of `layoutChanged`.
 * @group Events
 */
export interface DashboardChangeEvent {
    /** What caused it. */
    type: 'drag' | 'resize' | 'add' | 'remove' | 'move' | 'update' | 'clear' | 'keyboard';
    /** The layout before. */
    previous: PanelModel[];
    /** The layout now. */
    panels: PanelModel[];
    /** The panel it was about, when there is one. */
    panel?: PanelModel;
}

/**
 * Context of the `#panel` and `#header` templates.
 * @group Types
 */
export interface DashboardPanelContext {
    $implicit: PanelModel;
    id: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface DashboardLayoutPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    panel?: PassThroughOption<HTMLElement, any>;
    header?: PassThroughOption<HTMLElement, any>;
    content?: PassThroughOption<HTMLElement, any>;
    placeholder?: PassThroughOption<HTMLElement, any>;
    handle?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type DashboardLayoutPassThrough<I = unknown> = PassThrough<I, DashboardLayoutPassThroughOptions>;
