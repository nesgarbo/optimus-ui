import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * A document as Tiptap and ProseMirror write it: a tree of nodes.
 * @group Interface
 */
export interface BlockContent {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: BlockContent[];
    marks?: { type: string; attrs?: Record<string, unknown> }[];
    text?: string;
}

/**
 * How the value is held: as a tree of nodes, or as HTML.
 * @group Types
 */
export type BlockFormat = 'json' | 'html';

/**
 * One entry of the menu that `/` opens.
 * @group Interface
 */
export interface BlockCommand {
    /** Identifies the entry. */
    id: string;
    /** What the menu shows. */
    label: string;
    /** A line under the label. */
    description?: string;
    /** Words that find the entry as the user types, besides its label. */
    keywords?: string[];
    /** Short mark on the left of the entry. */
    icon?: string;
}

/**
 * Event of `changed`.
 * @group Events
 */
export interface BlockChangeEvent {
    /** The document as a tree. */
    json: BlockContent;
    /** The document as HTML. */
    html: string;
    /** `true` when the document has nothing in it. */
    empty: boolean;
}

/**
 * Event of `imageRequested`: a picture was asked for and the app can supply its URL. Set `url` to it.
 * @group Events
 */
export interface BlockImageRequest {
    /** The file the user chose. */
    file: File;
    /** The URL to put in the picture. Left out, the file is embedded as a data URL. */
    url?: string | Promise<string>;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface BlockEditorPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    content?: PassThroughOption<HTMLElement, any>;
    bubble?: PassThroughOption<HTMLElement, any>;
    slash?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type BlockEditorPassThrough<I = unknown> = PassThrough<I, BlockEditorPassThroughOptions>;
