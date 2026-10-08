import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/signature';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-signature p-component',
        {
            'p-signature-empty': instance.isEmpty(),
            'p-signature-readonly': instance.locked(),
            'p-signature-drawing': instance.drawing(),
            'p-signature-invalid': instance.$invalid(),
            'p-disabled': instance.$disabled()
        }
    ],
    canvas: 'p-signature-canvas'
};

@Injectable()
export class SignatureStyle extends BaseStyle {
    name = 'signature';

    style = style;

    classes = classes;
}

/**
 *
 * Signature captures a handwritten signature from a pointer, pen or finger.
 *
 * [Live Demo](https://optimus.openng.org/signature/)
 *
 * @module signaturestyle
 *
 */
export enum SignatureClasses {
    /** Class name of the root element */
    root = 'p-signature',
    /** Class name of the canvas */
    canvas = 'p-signature-canvas'
}

export interface SignatureStyle {
    /** Used to pass tokens of the component */
    name: string;
}
