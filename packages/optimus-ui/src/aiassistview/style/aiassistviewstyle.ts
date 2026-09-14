import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/aiassistview';
import { BaseStyle } from '@openng/optimus-ui/base';

// The state classes are produced here rather than written onto the element imperatively: the root
// carries a `[class]` binding, and a `classList` write behind its back survives only until that
// binding next evaluates.
const classes = {
    root: ({ instance }) => [
        'p-aiassistview p-component',
        `p-aiassistview-${instance.density()}`,
        `p-aiassistview-${instance.layout()}`,
        {
            'p-aiassistview-disabled': instance.disabled(),
            'p-aiassistview-readonly': instance.readonly(),
            'p-aiassistview-rtl': instance.rtl(),
            'p-aiassistview-busy': instance.assistState.busy(),
            'p-aiassistview-listening': instance.assistState.listening(),
            'p-aiassistview-dropping': instance.assistState.dropping(),
            'p-aiassistview-empty': instance.assistState.empty()
        }
    ]
};

@Injectable()
export class AIAssistViewStyle extends BaseStyle {
    name = 'aiassistview';

    style = style;

    classes = classes;
}

/**
 *
 * AIAssistView is a conversational surface: a transcript of prompts and answers, a composer, and the
 * reasoning, tool and attachment affordances a modern assistant needs around them.
 *
 * [Live Demo](https://optimus.openng.org/aiassistview/)
 *
 * @module aiassistviewstyle
 *
 */
export enum AIAssistViewClasses {
    /** Class name of the root element */
    root = 'p-aiassistview',
    /** Class name of the header element */
    header = 'p-aiassistview-header',
    /** Class name of the title element */
    title = 'p-aiassistview-title',
    /** Class name of the view switcher */
    views = 'p-aiassistview-views',
    /** Class name of one view tab */
    viewTab = 'p-aiassistview-view-tab',
    /** Class name of a toolbar strip */
    toolbar = 'p-aiassistview-toolbar',
    /** Class name of one toolbar entry */
    toolbarItem = 'p-aiassistview-toolbar-item',
    /** Class name of the element wrapping the transcript and the scroll button */
    body = 'p-aiassistview-body',
    /** Class name of the scrolling transcript */
    content = 'p-aiassistview-content',
    /** Class name of the turn list */
    turns = 'p-aiassistview-turns',
    /** Class name of one turn */
    turn = 'p-aiassistview-turn',
    /** Class name of one message row */
    message = 'p-aiassistview-message',
    /** Class name of a message avatar */
    avatar = 'p-aiassistview-avatar',
    /** Class name of a message bubble */
    bubble = 'p-aiassistview-bubble',
    /** Class name of the block list of one answer */
    blocks = 'p-aiassistview-blocks',
    /** Class name of a prose block */
    textBlock = 'p-aiassistview-text',
    /** Class name of a code block */
    codeBlock = 'p-aiassistview-code',
    /** Class name of a reasoning panel */
    thinkingBlock = 'p-aiassistview-thinking',
    /** Class name of one reasoning step */
    stage = 'p-aiassistview-stage',
    /** Class name of one reasoning chip */
    contextItem = 'p-aiassistview-context-item',
    /** Class name of a tool block */
    toolBlock = 'p-aiassistview-tool',
    /** Class name of an error block */
    errorBlock = 'p-aiassistview-error',
    /** Class name of the empty state */
    banner = 'p-aiassistview-banner',
    /** Class name of the suggestion list */
    suggestions = 'p-aiassistview-suggestions',
    /** Class name of one suggestion chip */
    suggestion = 'p-aiassistview-suggestion',
    /** Class name of the scroll-to-newest button */
    scrollBottom = 'p-aiassistview-scroll-bottom',
    /** Class name of the footer element */
    footer = 'p-aiassistview-footer',
    /** Class name of the element wrapping the editor */
    editorWrapper = 'p-aiassistview-editor-wrapper',
    /** Class name of the editor */
    editor = 'p-aiassistview-editor',
    /** Class name of the send button */
    send = 'p-aiassistview-send',
    /** Class name of the stop button */
    stop = 'p-aiassistview-stop',
    /** Class name of the attachment list */
    attachments = 'p-aiassistview-attachments',
    /** Class name of one attachment chip */
    attachment = 'p-aiassistview-attachment',
    /** Class name of a custom view's surface */
    customView = 'p-aiassistview-custom-view'
}

export interface AIAssistViewStyle extends BaseStyle {}
