import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/cropper';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-cropper p-component',
        {
            'p-cropper-empty': !instance.loaded(),
            'p-cropper-invalid': instance.$invalid(),
            'p-disabled': instance.$disabled()
        }
    ],
    stage: 'p-cropper-stage'
};

@Injectable()
export class CropperStyle extends BaseStyle {
    name = 'cropper';

    style = style;

    classes = classes;
}

/**
 *
 * Cropper crops, rotates, flips and zooms an image, on top of Cropper.js.
 *
 * [Live Demo](https://optimus.openng.org/cropper/)
 *
 * @module cropperstyle
 *
 */
export enum CropperClasses {
    /** Class name of the root element */
    root = 'p-cropper',
    /** Class name of the element Cropper.js draws in */
    stage = 'p-cropper-stage'
}

export interface CropperStyle {
    /** Used to pass tokens of the component */
    name: string;
}
