import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/spreadsheet';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-spreadsheet p-component',
        {
            'p-spreadsheet-loading': !instance.ready(),
            'p-spreadsheet-readonly': instance.locked(),
            'p-spreadsheet-invalid': instance.$invalid(),
            'p-disabled': instance.$disabled()
        }
    ],
    container: 'p-spreadsheet-container'
};

@Injectable()
export class SpreadsheetStyle extends BaseStyle {
    name = 'spreadsheet';

    style = style;

    classes = classes;
}

/**
 *
 * Spreadsheet is a spreadsheet with formulas, formatting and a toolbar, on top of Univer.
 *
 * [Live Demo](https://optimus.openng.org/spreadsheet/)
 *
 * @module spreadsheetstyle
 *
 */
export enum SpreadsheetClasses {
    /** Class name of the root element */
    root = 'p-spreadsheet',
    /** Class name of the element Univer draws in */
    container = 'p-spreadsheet-container'
}

export interface SpreadsheetStyle {
    /** Used to pass tokens of the component */
    name: string;
}
