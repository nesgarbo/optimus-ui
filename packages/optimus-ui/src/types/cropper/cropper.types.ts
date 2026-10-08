import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * Image formats a crop can be exported to.
 * @group Types
 */
export type CropperOutputType = 'image/png' | 'image/jpeg' | 'image/webp';

/**
 * The crop box, in CSS pixels of the cropper.
 * @group Interface
 */
export interface CropperSelectionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Options of `toDataURL`, `toBlob` and `getCroppedCanvas`.
 * @group Interface
 */
export interface CropperExportOptions {
    /** Width of the output, in pixels. The height follows the crop's proportions unless it is set too. */
    width?: number;
    /** Height of the output, in pixels. */
    height?: number;
    /** Format of the output. Defaults to the `outputType` input. */
    type?: CropperOutputType;
    /** Quality of a lossy format, from 0 to 1. Defaults to the `quality` input. */
    quality?: number;
    /** Colour under a transparent image. Empty keeps it transparent (`image/jpeg` always gets white). */
    fillColor?: string;
}

/**
 * Event of `changed`.
 * @group Events
 */
export interface CropperChangeEvent {
    /** What happened. */
    type: 'crop' | 'rotate' | 'flip' | 'zoom' | 'reset' | 'clear' | 'select-all';
    /** The crop box after the change, or `null` when there is none. */
    selection: CropperSelectionRect | null;
    /** The crop as a data URL, or `null` when there is no crop box. */
    value: string | null;
}

/**
 * The text the cropper announces. Every entry can be replaced through the `messages` input.
 * @group Types
 */
export interface CropperMessages {
    /** Name of the crop area for assistive technology when the image has no `alt`. */
    imageToCrop: string;
    /** Error of the `failed` event when the image cannot be loaded. */
    imageLoadFailed: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface CropperPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    stage?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type CropperPassThrough<I = unknown> = PassThrough<I, CropperPassThroughOptions>;
