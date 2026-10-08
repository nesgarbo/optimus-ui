import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/button';
import { BaseStyle } from '@openng/optimus-ui/base';

// The instance is a Button component or a ButtonDirective: their props are signals, and some of them exist in only one of the two.
const read = (value: any) => (typeof value === 'function' ? value() : value);

const classes = {
    root: ({ instance }) => {
        const props = read(instance.buttonProps);
        const label = read(instance.label);
        const iconPos = read(instance.iconPos);
        const severity = read(instance.severity) || props?.severity;
        const variant = read(instance.variant);
        const size = read(instance.size) || props?.size;

        return [
            'p-button p-component',
            {
                'p-button-icon-only': instance.hasIcon && !label && !props?.label && !read(instance.badge),
                'p-button-vertical': (iconPos === 'top' || iconPos === 'bottom') && label,
                'p-button-loading': read(instance.loading) || props?.loading,
                'p-button-link': read(instance.link) || props?.link,
                [`p-button-${severity}`]: severity,
                'p-button-raised': read(instance.raised) || props?.raised,
                'p-button-rounded': read(instance.rounded) || props?.rounded,
                'p-button-text': read(instance.text) || variant === 'text' || props?.text || props?.variant === 'text',
                'p-button-outlined': read(instance.outlined) || variant === 'outlined' || props?.outlined || props?.variant === 'outlined',
                'p-button-sm': size === 'small',
                'p-button-lg': size === 'large',
                'p-button-plain': read(instance.plain) || props?.plain,
                'p-button-fluid': instance.hasFluid
            }
        ];
    },
    loadingIcon: 'p-button-loading-icon',
    icon: ({ instance }) => {
        const props = read(instance.buttonProps);
        const label = read(instance.label) || props?.label;
        const iconPos = read(instance.iconPos);
        const pos = iconPos || props?.iconPos;

        return [
            'p-button-icon',
            {
                [`p-button-icon-${pos}`]: label,
                'p-button-icon-left': ((iconPos === 'left' || props?.iconPos === 'left') && read(instance.label)) || props?.label,
                'p-button-icon-right': ((iconPos === 'right' || props?.iconPos === 'right') && read(instance.label)) || props?.label,
                'p-button-icon-top': ((iconPos === 'top' || props?.iconPos === 'top') && read(instance.label)) || props?.label,
                'p-button-icon-bottom': ((iconPos === 'bottom' || props?.iconPos === 'bottom') && read(instance.label)) || props?.label
            },
            read(instance.icon),
            props?.icon
        ];
    },
    spinnerIcon: ({ instance }) => {
        return Object.entries(instance.cx('icon'))
            .filter(([, value]) => !!value)
            .reduce((acc, [key]) => acc + ` ${key}`, 'p-button-loading-icon');
    },
    label: 'p-button-label'
};

@Injectable()
export class ButtonStyle extends BaseStyle {
    name = 'button';

    style = style;

    classes = classes;
}

/**
 *
 * Button is an extension to standard button element with icons and theming.
 *
 * [Live Demo](https://optimus.openng.org/button/)
 *
 * @module buttonstyle
 *
 */
export enum ButtonClasses {
    /**
     * Class name of the root element
     */
    root = 'p-button',
    /**
     * Class name of the loading icon element
     */
    loadingIcon = 'p-button-loading-icon',
    /**
     * Class name of the icon element
     */
    icon = 'p-button-icon',
    /**
     * Class name of the label element
     */
    label = 'p-button-label'
}

export interface ButtonStyle extends BaseStyle {}
