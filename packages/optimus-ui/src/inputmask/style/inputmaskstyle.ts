import { Injectable } from '@angular/core';
import { BaseStyle } from '@openng/optimus-ui/base';

const style = /*css*/ `
    /* For Optimus */
    p-inputmask {
        position: relative;
    }

    button.p-inputmask-icon-button {
        appearance: none;
        background: transparent;
        border: 0;
        padding: 0;
        margin: 0;
        font: inherit;
        color: inherit;
        line-height: 0;
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        inset-inline-end: dt('form.field.padding.x');
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* The icon sits in the flow of the button, so the button has a real hit area and focus box. */
    button.p-inputmask-icon-button > * {
        position: static;
        inset: auto;
        margin: 0;
    }

    button.p-inputmask-icon-button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
        border-radius: 2px;
    }

    .p-inputmask-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    p-inputMask:has(.p-inputtext-fluid),
    p-input-mask:has(.p-inputtext-fluid),
    p-inputmask:has(.p-inputtext-fluid) {
        width: 100%;
    }

    p-inputMask.ng-invalid.ng-dirty > .p-inputtext,
    p-input-mask.ng-invalid.ng-dirty > .p-inputtext,
    p-inputmask.ng-invalid.ng-dirty > .p-inputtext {
        border-color: dt('inputtext.invalid.border.color');
    }

    p-inputMask.ng-invalid.ng-dirty > .p-inputtext:enabled:focus,
    p-input-mask.ng-invalid.ng-dirty > .p-inputtext:enabled:focus,
    p-inputmask.ng-invalid.ng-dirty > .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
    }

    p-inputMask.ng-invalid.ng-dirty > .p-inputtext::placeholder,
    p-input-mask.ng-invalid.ng-dirty > .p-inputtext::placeholder,
    p-inputmask.ng-invalid.ng-dirty > .p-inputtext::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }
`;

const classes = {
    root: ({ instance }) => [
        'p-inputmask p-component p-inputwrapper',
        {
            'p-variant-filled': instance.$variant() === 'filled'
        }
    ],
    clearIcon: 'p-inputmask-clear-icon'
};

@Injectable()
export class InputMaskStyle extends BaseStyle {
    name = 'inputmask';

    style = style;

    classes = classes;
}

/**
 *
 * InputMask component is used to enter input in a certain format such as numeric, date, currency, email and phone.
 *
 * [Live Demo](https://optimus.openng.org/inputmask/)
 *
 * @module inputmaskstyle
 *
 */

export enum InputMaskClasses {
    /**
     * Class name of the root element
     */
    root = 'p-inputmask',
    /**
     * Class name of the clear icon element
     */
    clearIcon = 'p-inputmask-clear-icon'
}

export interface InputMaskStyle extends BaseStyle {}
