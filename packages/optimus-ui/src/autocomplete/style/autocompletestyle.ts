import { Injectable } from '@angular/core';
import { style as autocomplete_style } from '@openng/optimus-ui-styles/autocomplete';
import { BaseStyle } from '@openng/optimus-ui/base';

const style = /*css*/ `
${autocomplete_style}

/* For Optimus */
button.p-autocomplete-icon-button {
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
    inset-inline-end: dt('autocomplete.padding.x');
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* The icon sits in the flow of the button, so the button has a real hit area and focus box. */
button.p-autocomplete-icon-button > * {
    position: static;
    inset: auto;
    margin: 0;
}

.p-autocomplete:has(.p-autocomplete-dropdown) button.p-autocomplete-icon-button {
    inset-inline-end: calc(dt('autocomplete.padding.x') + dt('autocomplete.dropdown.width'));
}

button.p-autocomplete-icon-button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 2px;
}

p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input,
p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input-multiple,
p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input,
p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input-multiple p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input,
p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input-multiple {
    border-color: dt('autocomplete.invalid.border.color');
}

p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
p-autoComplete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple,
p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
p-auto-complete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple,
p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input:enabled:focus,
p-autocomplete.ng-invalid.ng-dirty:not(.p-disabled).p-focus .p-autocomplete-input-multiple {
    border-color: dt('autocomplete.focus.border.color');
}

p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder,
p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder,
p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input-chip input::placeholder {
    color: dt('autocomplete.invalid.placeholder.color');
}

p-autoComplete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder,
p-auto-complete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder,
p-autocomplete.ng-invalid.ng-dirty .p-autocomplete-input::placeholder {
    color: dt('autocomplete.invalid.placeholder.color');
}
`;

const inlineStyles = {
    root: { position: 'relative' }
};

const classes = {
    root: ({ instance }) => [
        'p-autocomplete p-component p-inputwrapper',
        {
            'p-invalid': instance.$invalid(),
            'p-focus': instance.focused,
            'p-inputwrapper-filled': instance.$filled(),
            'p-inputwrapper-focus': (instance.focused && !instance.$disabled()) || instance.autofocus || instance.overlayVisible,
            'p-autocomplete-open': instance.overlayVisible,
            'p-autocomplete-clearable': instance.showClear && !instance.$disabled(),
            'p-autocomplete-fluid': instance.hasFluid
        }
    ],
    pcInputText: 'p-autocomplete-input',
    inputMultiple: ({ instance }) => [
        'p-autocomplete-input-multiple',
        {
            'p-disabled': instance.$disabled(),
            'p-variant-filled': instance.$variant() === 'filled'
        }
    ],
    chipItem: ({ instance, i }) => [
        'p-autocomplete-chip-item',
        {
            'p-focus': instance.focusedMultipleOptionIndex() === i
        }
    ],
    pcChip: 'p-autocomplete-chip',
    chipIcon: 'p-autocomplete-chip-icon',
    inputChip: 'p-autocomplete-input-chip',
    loader: 'p-autocomplete-loader',
    dropdown: 'p-autocomplete-dropdown',
    overlay: ({ instance }) => ['p-autocomplete-overlay p-component-overlay p-component', { 'p-input-filled': instance.$variant() === 'filled', 'p-ripple-disabled': instance.config.ripple() === false }],
    listContainer: 'p-autocomplete-list-container',
    list: 'p-autocomplete-list',
    optionGroup: 'p-autocomplete-option-group',
    option: ({ instance, option, i, scrollerOptions }) => ({
        'p-autocomplete-option': true,
        'p-autocomplete-option-selected': instance.isSelected(option),
        'p-focus': instance.focusedOptionIndex() === instance.getOptionIndex(i, scrollerOptions),
        'p-disabled': instance.isOptionDisabled(option)
    }),
    emptyMessage: 'p-autocomplete-empty-message',
    clearIcon: 'p-autocomplete-clear-icon'
};

@Injectable()
export class AutoCompleteStyle extends BaseStyle {
    name = 'autocomplete';

    style = style;

    classes = classes;

    inlineStyles = inlineStyles;
}

/**
 *
 * AutoComplete is an input component that provides real-time suggestions while being typed.
 *
 * [Live Demo](https://optimus.openng.org/autocomplete/)
 *
 * @module autocompletestyle
 *
 */
export enum AutoCompleteClasses {
    /**
     * Class name of the root element
     */
    root = 'p-autocomplete',
    /**
     * Class name of the input element
     */
    pcInputText = 'p-autocomplete-input',
    /**
     * Class name of the input multiple element
     */
    inputMultiple = 'p-autocomplete-input-multiple',
    /**
     * Class name of the chip item element
     */
    chipItem = 'p-autocomplete-chip-item',
    /**
     * Class name of the chip element
     */
    pcChip = 'p-autocomplete-chip',
    /**
     * Class name of the chip icon element
     */
    chipIcon = 'p-autocomplete-chip-icon',
    /**
     * Class name of the input chip element
     */
    inputChip = 'p-autocomplete-input-chip',
    /**
     * Class name of the loader element
     */
    loader = 'p-autocomplete-loader',
    /**
     * Class name of the dropdown element
     */
    dropdown = 'p-autocomplete-dropdown',
    /**
     * Class name of the panel element
     */
    panel = 'p-autocomplete-overlay',
    /**
     * Class name of the list element
     */
    list = 'p-autocomplete-list',
    /**
     * Class name of the option group element
     */
    optionGroup = 'p-autocomplete-option-group',
    /**
     * Class name of the option element
     */
    option = 'p-autocomplete-option',
    /**
     * Class name of the empty message element
     */
    emptyMessage = 'p-autocomplete-empty-message',
    /**
     * Class name of the clear icon
     */
    clearIcon = 'p-autocomplete-clear-icon'
}

export interface AutoCompleteStyle extends BaseStyle {}
