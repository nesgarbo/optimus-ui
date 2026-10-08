import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Where the text, value and extras of an item live.
 * @group Types
 */
export interface MentionFields {
    /** Property holding the text shown and inserted. Defaults to `text`; strings need none. */
    text?: string;
    /** Property holding the value of the item. Defaults to the text. */
    value?: string;
    /** Property holding a CSS class for an icon drawn before the text. */
    iconCss?: string;
    /** Property holding the heading the item is grouped under. */
    groupBy?: string;
    /** Property holding `true` for an item that cannot be picked. */
    disabled?: string;
}

/**
 * How the typed text is matched against an item.
 * @group Types
 */
export type MentionSearchPattern = 'startsWith' | 'contains' | 'endsWith';

/**
 * One row of the list as drawn.
 * @group Types
 */
export interface MentionOption {
    item: any;
    text: string;
    value: any;
    iconCss?: string;
    group?: string;
    disabled: boolean;
    /** Position in the drawn list, headings excluded. */
    index: number;
}

/**
 * Event of `itemSelect`. Set `cancel` to keep the text as typed.
 * @group Events
 */
export interface MentionSelectEvent {
    /** The picked item. */
    item: any;
    /** The text that will be inserted. */
    text: string;
    /** Set to `true` to cancel the insertion. */
    cancel: boolean;
    originalEvent?: Event;
}

/**
 * Event of `filtering`. Set `cancel` and call `updateData` to answer from a server.
 * @group Events
 */
export interface MentionFilteringEvent {
    /** What the user typed after the mention character. */
    text: string;
    /** Set to `true` to skip the built-in filter. */
    cancel: boolean;
    /** Replaces the list with `items`. */
    updateData: (items: any[]) => void;
}

/**
 * Event of `beforeOpen`. Set `cancel` to keep the list closed.
 * @group Events
 */
export interface MentionBeforeOpenEvent {
    cancel: boolean;
}

/**
 * Context of the `#item` template.
 * @group Types
 */
export interface MentionItemContext {
    $implicit: any;
    text: string;
    active: boolean;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface MentionPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    popup?: PassThroughOption<HTMLElement, any>;
    list?: PassThroughOption<HTMLElement, any>;
    item?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type MentionPassThrough<I = unknown> = PassThrough<I, MentionPassThroughOptions>;
