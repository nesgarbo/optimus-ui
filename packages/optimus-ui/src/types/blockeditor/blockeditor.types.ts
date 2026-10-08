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
 * The text the block editor shows and announces. Every entry can be replaced through the `messages` input. The names of the blocks come from `commands`.
 * @group Types
 */
export interface BlockEditorMessages {
    /** Name of the editable area when `aria-label` is not set. */
    editor: string;
    /** Name and tooltip of the drag handle. */
    dragHandle: string;
    /** Name of the formatting toolbar. */
    format: string;
    /** Bold button. */
    bold: string;
    /** Italic button. */
    italic: string;
    /** Strikethrough button. */
    strikethrough: string;
    /** Code button. */
    code: string;
    /** Link button. */
    link: string;
    /** Placeholder of the link field. */
    linkPlaceholder: string;
    /** Name of the link field. */
    linkAddress: string;
    /** Button that applies the link. */
    apply: string;
    /** Button that removes the link. */
    remove: string;
    /** Name of the slash menu. */
    blocks: string;
    /** Shown when no block matches what was typed. */
    noBlocks: string;
    /** Error when the editor cannot start and the cause gives no message. */
    startFailed: string;
    /** Error when a picture cannot be added and the cause gives no message. */
    pictureAddFailed: string;
    /** Error when a picture cannot be read. */
    pictureUnreadable: string;
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
