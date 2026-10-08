import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The one-dimensional symbologies. `code128` picks the shortest mix of sets B and C; `code128A`, `code128B` and `code128C` force one.
 * @group Types
 */
export type BarcodeType = 'code39' | 'code39Extended' | 'code11' | 'codabar' | 'code128' | 'code128A' | 'code128B' | 'code128C' | 'ean8' | 'ean13' | 'upcA';

/**
 * How much of a QR Code is spent on error correction.
 * @group Types
 */
export type QrErrorCorrection = 'low' | 'medium' | 'quartile' | 'high';

/**
 * A picture for the middle of a QR Code.
 * @group Types
 */
export interface QRLogo {
    /** A URL or a data URL. */
    imageSource: string;
    /** In pixels. Default 64. */
    width?: number;
    /** In pixels. Default 64. */
    height?: number;
}

/**
 * Whether a symbol is drawn as SVG or on a canvas.
 * @group Types
 */
export type BarcodeMode = 'svg' | 'canvas';

/**
 * The formats a symbol can be exported to.
 * @group Types
 */
export type BarcodeExportFormat = 'svg' | 'png' | 'jpeg';

/**
 * Space around the symbol, in pixels.
 * @group Types
 */
export interface BarcodeMargin {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

/**
 * The text printed with the symbol. Mirrors Syncfusion's `displayText`.
 * @group Types
 */
export interface BarcodeDisplayText {
    /** Draws the text. Default `true` for a barcode, `false` for a QR Code. */
    visibility?: boolean;
    /** The text. Defaults to the value, with any check character the symbology added. */
    text?: string;
    /** Above or below the symbol. */
    position?: 'top' | 'bottom';
    /** Font size in pixels. */
    size?: number;
    /** Color of the text. Defaults to `foreColor`. */
    color?: string;
    /** Font family. */
    font?: string;
    /** Space between the symbol and the text, in pixels. */
    margin?: number;
    /** Where the text sits along the symbol. */
    alignment?: 'start' | 'center' | 'end';
}

/**
 * Event of `invalid`.
 * @group Events
 */
export interface BarcodeInvalidEvent {
    /** Why the value cannot be written. */
    message: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface BarcodePassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    svg?: PassThroughOption<SVGElement, any>;
    canvas?: PassThroughOption<HTMLCanvasElement, any>;
}

/**
 * @group Interface
 */
export type BarcodePassThrough<I = unknown> = PassThrough<I, BarcodePassThroughOptions>;
