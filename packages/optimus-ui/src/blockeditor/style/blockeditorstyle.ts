import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/blockeditor';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-blockeditor p-component',
        {
            'p-blockeditor-empty': instance.isEmpty(),
            'p-blockeditor-readonly': instance.locked(),
            'p-blockeditor-focused': instance.focused(),
            'p-blockeditor-invalid': instance.$invalid(),
            'p-disabled': instance.$disabled()
        }
    ],
    content: 'p-blockeditor-content',
    bubble: 'p-blockeditor-bubble',
    bubbleButton: ({ active }) => ['p-blockeditor-bubble-button', { 'p-blockeditor-bubble-button-active': active }],
    slash: 'p-blockeditor-slash',
    slashItem: ({ active }) => ['p-blockeditor-slash-item', { 'p-blockeditor-slash-item-active': active }]
};

@Injectable()
export class BlockEditorStyle extends BaseStyle {
    name = 'blockeditor';

    style = style;

    classes = classes;
}

/**
 *
 * BlockEditor is a block-based editor: every paragraph, heading, list, to-do, quote, code block or picture is a block, added from a slash menu. It is built on Tiptap.
 *
 * [Live Demo](https://optimus.openng.org/blockeditor/)
 *
 * @module blockeditorstyle
 *
 */
export enum BlockEditorClasses {
    /** Class name of the root element */
    root = 'p-blockeditor',
    /** Class name of the element the document is written in */
    content = 'p-blockeditor-content',
    /** Class name of the toolbar that opens over a selection */
    bubble = 'p-blockeditor-bubble',
    /** Class name of the menu that `/` opens */
    slash = 'p-blockeditor-slash'
}

export interface BlockEditorStyle {
    /** Used to pass tokens of the component */
    name: string;
}
