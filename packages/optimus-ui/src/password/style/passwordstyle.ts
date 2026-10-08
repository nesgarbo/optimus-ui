import { Injectable } from '@angular/core';
import { style as password_style } from '@openng/optimus-ui-styles/password';
import { BaseStyle } from '@openng/optimus-ui/base';

const style = /*css*/ `
${password_style}

/* For Optimus */
button.p-password-icon-button {
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
button.p-password-icon-button > * {
    position: static;
    inset: auto;
    margin: 0;
}

.p-password:has(.p-password-toggle-mask-icon) button.p-password-icon-button:has(> .p-password-clear-icon) {
    inset-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
}

button.p-password-icon-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
}

.p-password-overlay {
    min-width: 100%;
}

p-password.ng-invalid.ng-dirty .p-inputtext {
    border-color: dt('inputtext.invalid.border.color');
}

p-password.ng-invalid.ng-dirty .p-inputtext:enabled:focus {
    border-color: dt('inputtext.focus.border.color');
}

p-password.ng-invalid.ng-dirty .p-inputtext::placeholder {
    color: dt('inputtext.invalid.placeholder.color');
}

.p-password-fluid-directive {
    width: 100%;
}

/* Animations */
.p-password-enter {
    animation: p-animate-password-enter 300ms cubic-bezier(.19,1,.22,1);
}

.p-password-leave {
    animation: p-animate-password-leave 300ms cubic-bezier(.19,1,.22,1);
}

@keyframes p-animate-password-enter {
    from {
        opacity: 0;
        transform: scale(0.93);
    }
}

@keyframes p-animate-password-leave {
    to {
        opacity: 0;
        transform: scale(0.93);
    }
}
`;

const inlineStyles = {
    root: ({ instance }) => ({ position: instance.$appendTo() === 'self' ? 'relative' : undefined }),
    overlay: { position: 'absolute' }
};

const classes = {
    root: ({ instance }) => [
        'p-password p-component p-inputwrapper',
        {
            'p-inputwrapper-filled': instance.$filled(),
            'p-variant-filled': instance.$variant() === 'filled',
            'p-inputwrapper-focus': instance.focused,
            'p-password-fluid': instance.hasFluid
        }
    ],
    rootDirective: ({ instance }) => [
        'p-password p-inputtext p-component p-inputwrapper',
        {
            'p-inputwrapper-filled': instance.$filled(),
            'p-variant-filled': instance.$variant() === 'filled',
            'p-password-fluid-directive': instance.hasFluid
        }
    ],
    pcInputText: 'p-password-input',
    maskIcon: 'p-password-toggle-mask-icon p-password-mask-icon',
    unmaskIcon: 'p-password-toggle-mask-icon p-password-unmask-icon',
    overlay: 'p-password-overlay p-component',
    content: 'p-password-content',
    meter: 'p-password-meter',
    meterLabel: ({ instance }) => `p-password-meter-label ${instance.meter ? 'p-password-meter-' + instance.meter.strength : ''}`,
    meterText: 'p-password-meter-text',
    clearIcon: 'p-password-clear-icon'
};

@Injectable()
export class PasswordStyle extends BaseStyle {
    name = 'password';

    style = style;

    classes = classes;

    inlineStyles = inlineStyles;
}

/**
 *
 * Password displays strength indicator for password fields.
 *
 * [Live Demo](https://optimus.openng.org/password/)
 *
 * @module passwordstyle
 *
 */

export enum PasswordClasses {
    /**
     * Class name of the root element
     */
    root = 'p-password',
    /**
     * Class name of the pt input element
     */
    pcInputText = 'p-password-input',
    /**
     * Class name of the mask icon element
     */
    maskIcon = 'p-password-mask-icon',
    /**
     * Class name of the unmask icon element
     */
    unmaskIcon = 'p-password-unmask-icon',
    /**
     * Class name of the overlay element
     */
    overlay = 'p-password-overlay',
    /**
     * Class name of the meter element
     */
    meter = 'p-password-meter',
    /**
     * Class name of the meter label element
     */
    meterLabel = 'p-password-meter-label',
    /**
     * Class name of the meter text element
     */
    meterText = 'p-password-meter-text',
    /**
     * Class name of the clear icon
     */
    clearIcon = 'p-password-clear-icon'
}

export interface PasswordStyle extends BaseStyle {}
