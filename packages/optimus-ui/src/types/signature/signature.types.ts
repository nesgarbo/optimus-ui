import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The formats a signature can be exported to.
 * @group Types
 */
export type SignatureFileType = 'png' | 'jpeg' | 'svg';

/**
 * One sampled point of a stroke, in CSS pixels of the pad.
 * @group Types
 */
export interface SignaturePoint {
    x: number;
    y: number;
    /** Milliseconds since the stroke began. */
    t: number;
}

/**
 * One pen-down to pen-up line.
 * @group Types
 */
export interface SignatureStroke {
    points: SignaturePoint[];
    color: string;
    minWidth: number;
    maxWidth: number;
    velocity: number;
}

/**
 * Event of `changed`.
 * @group Events
 */
export interface SignatureChangeEvent {
    /** What happened. */
    type: 'draw' | 'undo' | 'redo' | 'clear' | 'load';
    /** `true` when the pad now holds nothing. */
    empty: boolean;
}

/**
 * Event of `beforeSave`. Set `cancel` to stop the export, or change `fileName` or `type`.
 * @group Events
 */
export interface SignatureBeforeSaveEvent {
    fileName: string;
    type: SignatureFileType;
    cancel: boolean;
}

/**
 * Event of `saved`.
 * @group Events
 */
export interface SignatureSavedEvent {
    fileName: string;
    type: SignatureFileType;
    /** The exported data URL. */
    dataUrl: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface SignaturePassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    canvas?: PassThroughOption<HTMLCanvasElement, any>;
}

/**
 * @group Interface
 */
export type SignaturePassThrough<I = unknown> = PassThrough<I, SignaturePassThroughOptions>;
