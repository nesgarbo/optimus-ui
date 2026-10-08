import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/mention';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: 'p-mention',
    popup: ({ instance }) => ['p-mention-popup p-component', { 'p-mention-popup-open': instance.isOpen() }],
    list: 'p-mention-list',
    group: 'p-mention-group',
    item: ({ instance, option }) => ['p-mention-item', { 'p-mention-item-active': instance.activeIndex() === option.index, 'p-mention-item-disabled': option.disabled }],
    icon: 'p-mention-icon',
    empty: 'p-mention-empty',
    header: 'p-mention-header',
    chip: 'p-mention-chip'
};

@Injectable()
export class MentionStyle extends BaseStyle {
    name = 'mention';

    style = style;

    classes = classes;
}

/**
 *
 * Mention opens a list of people or things when the user types a trigger character into a text field.
 *
 * [Live Demo](https://optimus.openng.org/mention/)
 *
 * @module mentionstyle
 *
 */
export enum MentionClasses {
    /** Class name of the root element */
    root = 'p-mention',
    /** Class name of the popup */
    popup = 'p-mention-popup',
    /** Class name of the list */
    list = 'p-mention-list',
    /** Class name of a group heading */
    group = 'p-mention-group',
    /** Class name of an item */
    item = 'p-mention-item',
    /** Class name of the inserted chip of a contenteditable target */
    chip = 'p-mention-chip'
}

export interface MentionStyle {
    /** Used to pass tokens of the component */
    name: string;
}
