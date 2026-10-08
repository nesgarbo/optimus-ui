import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * The text the PDF editor shows and announces. Every entry can be replaced through the `messages` input.
 * @group Types
 */
export interface PdfEditorMessages {
    /** Name of the toolbar. */
    toolbar: string;
    /** Button that shows or hides the page thumbnails. */
    thumbnails: string;
    /** Button to the previous page. */
    previousPage: string;
    /** Button to the next page. */
    nextPage: string;
    /** Button that zooms out. */
    zoomOut: string;
    /** Button that zooms in. */
    zoomIn: string;
    /** Button that fits the page to the width. */
    fitWidth: string;
    /** Name of the group of drawing tools. */
    tool: string;
    /** Select tool. */
    toolSelect: string;
    /** Text tool. Also names the text box while editing. */
    toolText: string;
    /** Highlight tool. */
    toolHighlight: string;
    /** Rectangle tool. */
    toolRectangle: string;
    /** Ellipse tool. */
    toolEllipse: string;
    /** Line tool. */
    toolLine: string;
    /** Arrow tool. */
    toolArrow: string;
    /** Freehand tool. */
    toolDraw: string;
    /** Image tool. */
    toolImage: string;
    /** Signature tool. */
    toolSignature: string;
    /** Colour picker. */
    colour: string;
    /** Line width select. */
    lineWidth: string;
    /** Font size select. */
    fontSize: string;
    /** Font select. */
    font: string;
    /** Undo button. */
    undo: string;
    /** Redo button. */
    redo: string;
    /** Button that deletes the selected annotation. */
    deleteSelected: string;
    /** Button that rotates the page. */
    rotatePage: string;
    /** Button that adds a blank page. */
    addBlankPage: string;
    /** Button that merges another PDF. */
    mergePdf: string;
    /** Button that deletes the page. */
    deletePage: string;
    /** Button that saves the file. */
    save: string;
    /** Name of the thumbnail list. */
    pages: string;
    /** Name of a thumbnail. `{page}` is replaced. */
    page: string;
    /** Name of the page canvas. `{page}` and `{count}` are replaced. */
    pageOf: string;
    /** Shown while the document loads. */
    loading: string;
    /** Shown when there is no document. */
    noDocument: string;
    /** Error when the document cannot be opened and the cause gives no message. */
    openFailed: string;
    /** Error when the request fails. `{status}` is replaced. */
    loadFailed: string;
    /** Error when the bytes are not a PDF. */
    notPdf: string;
    /** Error when a picture is too big. */
    pictureTooBig: string;
    /** Error when a picture cannot be read. */
    pictureUnreadable: string;
    /** Error when a picture cannot be placed. */
    picturePlaceFailed: string;
    /** Error when a page change fails and the cause gives no message. */
    changeFailed: string;
    /** Error of `save` when there is no document. */
    noDocumentError: string;
}

/**
 * What the pointer does on the page.
 * @group Types
 */
export type PdfTool = 'select' | 'text' | 'highlight' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'draw' | 'image' | 'signature';

/**
 * Fonts an annotation can be written in. These are the standard PDF fonts, which every reader has.
 * @group Types
 */
export type PdfFontFamily = 'helvetica' | 'times' | 'courier';

/**
 * Turns of a page, in degrees clockwise.
 * @group Types
 */
export type PdfRotation = 0 | 90 | 180 | 270;

/**
 * Fields every annotation has. Positions are in PDF points (1/72 inch), from the top left of the page as it is shown, which
 * is after the page's rotation.
 * @group Interface
 */
export interface PdfAnnotationBase {
    /** Identifies the annotation. Made up when it is left out. */
    id: string;
    /** Page the annotation is on, from 0. */
    page: number;
}

/**
 * Text written on the page.
 * @group Interface
 */
export interface PdfTextAnnotation extends PdfAnnotationBase {
    type: 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    fontFamily: PdfFontFamily;
    color: string;
}

/**
 * A translucent band over text.
 * @group Interface
 */
export interface PdfHighlightAnnotation extends PdfAnnotationBase {
    type: 'highlight';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
}

/**
 * A rectangle or an ellipse.
 * @group Interface
 */
export interface PdfShapeAnnotation extends PdfAnnotationBase {
    type: 'rectangle' | 'ellipse';
    x: number;
    y: number;
    width: number;
    height: number;
    /** Colour of the outline. */
    color: string;
    strokeWidth: number;
    /** Colour inside. Empty leaves the shape hollow. */
    fillColor: string;
    /** Opacity of the fill, from 0 to 1. */
    fillOpacity: number;
}

/**
 * A line, with or without an arrowhead.
 * @group Interface
 */
export interface PdfLineAnnotation extends PdfAnnotationBase {
    type: 'line' | 'arrow';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    strokeWidth: number;
}

/**
 * A freehand stroke.
 * @group Interface
 */
export interface PdfInkAnnotation extends PdfAnnotationBase {
    type: 'draw';
    /** The points of the stroke, as `[x, y]` pairs. */
    points: [number, number][];
    color: string;
    strokeWidth: number;
}

/**
 * A picture: a PNG or a JPEG, as a data URL. A signature is one of these.
 * @group Interface
 */
export interface PdfImageAnnotation extends PdfAnnotationBase {
    type: 'image' | 'signature';
    x: number;
    y: number;
    width: number;
    height: number;
    dataUrl: string;
}

/**
 * Anything that can be drawn on a page.
 * @group Interface
 */
export type PdfAnnotation = PdfTextAnnotation | PdfHighlightAnnotation | PdfShapeAnnotation | PdfLineAnnotation | PdfInkAnnotation | PdfImageAnnotation;

/**
 * An annotation to add: the same, with the `id` optional. One is made up when it is left out.
 * @group Types
 */
export type PdfAnnotationInput<T extends PdfAnnotation = PdfAnnotation> = T extends unknown ? Omit<T, 'id'> & { id?: string } : never;

/**
 * The kinds of field a form has.
 * @group Types
 */
export type PdfFormFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'list' | 'button' | 'signature' | 'unknown';

/**
 * A field of the form of the document, with where it is.
 * @group Interface
 */
export interface PdfFormField {
    /** Fully qualified name of the field. */
    name: string;
    type: PdfFormFieldType;
    /** Page the field is on, from 0. */
    page: number;
    /** Position of the field, as an annotation's is. */
    x: number;
    y: number;
    width: number;
    height: number;
    readOnly: boolean;
    required: boolean;
    multiline: boolean;
    /** What a dropdown, a list or a radio group offers. */
    options: string[];
    /** The value in the document. A checkbox holds `true` or `false`. */
    value: string | string[] | boolean;
    /** For a radio group, the option this button stands for. */
    option?: string;
}

/**
 * What the form is filled in with, by field name.
 * @group Types
 */
export type PdfFormValues = Record<string, string | string[] | boolean>;

/**
 * A page of the document.
 * @group Interface
 */
export interface PdfPageInfo {
    /** Position, from 0. */
    index: number;
    /** Width as the page is shown, in points. */
    width: number;
    /** Height as the page is shown, in points. */
    height: number;
    rotation: PdfRotation;
}

/**
 * Event of `changed`.
 * @group Events
 */
export interface PdfChangeEvent {
    type: 'annotation' | 'form' | 'page' | 'load' | 'undo' | 'redo';
}

/**
 * Event of `loaded`.
 * @group Events
 */
export interface PdfLoadedEvent {
    pages: number;
    fields: number;
}

/**
 * Event of `failed`.
 * @group Events
 */
export interface PdfFailedEvent {
    message: string;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface PdfEditorPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    toolbar?: PassThroughOption<HTMLElement, any>;
    sidebar?: PassThroughOption<HTMLElement, any>;
    stage?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type PdfEditorPassThrough<I = unknown> = PassThrough<I, PdfEditorPassThroughOptions>;
