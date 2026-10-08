import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/barcode';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => ['p-barcode p-component', { 'p-barcode-invalid': instance.invalidMessage(), 'p-barcode-empty': instance.isEmpty() }],
    svg: 'p-barcode-svg',
    canvas: 'p-barcode-canvas'
};

@Injectable()
export class BarcodeStyle extends BaseStyle {
    name = 'barcode';

    style = style;

    classes = classes;
}

/**
 *
 * Barcode and QRCode draw a value as a one-dimensional barcode or a QR Code, as SVG or on a canvas, and export it.
 *
 * [Live Demo](https://optimus.openng.org/barcode/)
 *
 * @module barcodestyle
 *
 */
export enum BarcodeClasses {
    /** Class name of the root element */
    root = 'p-barcode',
    /** Class name of the SVG element */
    svg = 'p-barcode-svg',
    /** Class name of the canvas element */
    canvas = 'p-barcode-canvas'
}

export interface BarcodeStyle {
    /** Used to pass tokens of the component */
    name: string;
}
