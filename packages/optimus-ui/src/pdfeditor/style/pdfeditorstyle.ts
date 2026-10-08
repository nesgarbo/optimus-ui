import { Injectable } from '@angular/core';
import { style } from '@openng/optimus-ui-styles/pdfeditor';
import { BaseStyle } from '@openng/optimus-ui/base';

const classes = {
    root: ({ instance }) => [
        'p-pdfeditor p-component',
        {
            'p-pdfeditor-loading': instance.loading(),
            'p-pdfeditor-readonly': instance.readonly(),
            'p-pdfeditor-empty': !instance.pages().length
        }
    ],
    toolbar: 'p-pdfeditor-toolbar',
    toolbarGroup: 'p-pdfeditor-toolbar-group',
    button: ({ pressed }) => ['p-pdfeditor-button', { 'p-pdfeditor-button-active': pressed }],
    body: 'p-pdfeditor-body',
    sidebar: 'p-pdfeditor-sidebar',
    thumbnail: ({ active }) => ['p-pdfeditor-thumbnail', { 'p-pdfeditor-thumbnail-active': active }],
    stage: 'p-pdfeditor-stage',
    page: 'p-pdfeditor-page',
    canvas: 'p-pdfeditor-canvas',
    overlay: 'p-pdfeditor-overlay',
    fields: 'p-pdfeditor-fields',
    field: 'p-pdfeditor-field',
    editor: 'p-pdfeditor-text-editor'
};

@Injectable()
export class PdfEditorStyle extends BaseStyle {
    name = 'pdfeditor';

    style = style;

    classes = classes;
}

/**
 *
 * PdfEditor edits PDF documents: annotations, form filling and page operations, with pdf.js and pdf-lib.
 *
 * [Live Demo](https://optimus.openng.org/pdfeditor/)
 *
 * @module pdfeditorstyle
 *
 */
export enum PdfEditorClasses {
    /** Class name of the root element */
    root = 'p-pdfeditor',
    /** Class name of the toolbar */
    toolbar = 'p-pdfeditor-toolbar',
    /** Class name of the sidebar of thumbnails */
    sidebar = 'p-pdfeditor-sidebar',
    /** Class name of the area the page is shown in */
    stage = 'p-pdfeditor-stage',
    /** Class name of the page */
    page = 'p-pdfeditor-page'
}

export interface PdfEditorStyle {
    /** Used to pass tokens of the component */
    name: string;
}
