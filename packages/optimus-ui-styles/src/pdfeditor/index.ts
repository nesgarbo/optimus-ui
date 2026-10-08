export const style = /*css*/ `
    .p-pdfeditor {
        display: flex;
        flex-direction: column;
        height: dt('pdfeditor.height');
        min-height: 16rem;
        background: dt('pdfeditor.background');
        color: dt('pdfeditor.color');
        border: 1px solid dt('pdfeditor.border.color');
        border-radius: dt('pdfeditor.border.radius');
        overflow: hidden;
        outline: none;
    }

    .p-pdfeditor-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: dt('pdfeditor.toolbar.gap');
        padding: dt('pdfeditor.toolbar.padding');
        background: dt('pdfeditor.toolbar.background');
        border-bottom: 1px solid dt('pdfeditor.border.color');
    }

    .p-pdfeditor-toolbar-group {
        display: flex;
        align-items: center;
        gap: 0.125rem;
        padding-inline-end: dt('pdfeditor.toolbar.gap');
        margin-inline-end: dt('pdfeditor.toolbar.gap');
        border-inline-end: 1px solid dt('pdfeditor.border.color');
    }

    .p-pdfeditor-toolbar-group:last-child {
        border-inline-end: 0;
        margin-inline-end: 0;
        padding-inline-end: 0;
    }

    .p-pdfeditor-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        color: inherit;
        background: transparent;
        border: 1px solid transparent;
        border-radius: dt('pdfeditor.button.border.radius');
        cursor: pointer;
    }

    .p-pdfeditor-button:hover:not(:disabled) {
        background: dt('pdfeditor.button.hover.background');
    }

    .p-pdfeditor-button:focus-visible {
        outline: 2px solid dt('pdfeditor.selection.color');
        outline-offset: 1px;
    }

    .p-pdfeditor-button:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .p-pdfeditor-button-active,
    .p-pdfeditor-button-active:hover:not(:disabled) {
        background: dt('pdfeditor.button.active.background');
        color: dt('pdfeditor.button.active.color');
    }

    .p-pdfeditor-icon {
        width: 1.125rem;
        height: 1.125rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.75;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .p-pdfeditor-toolbar input[type='color'] {
        width: 1.75rem;
        height: 1.75rem;
        padding: 0;
        background: none;
        border: 1px solid dt('pdfeditor.border.color');
        border-radius: dt('pdfeditor.button.border.radius');
        cursor: pointer;
    }

    .p-pdfeditor-toolbar select,
    .p-pdfeditor-toolbar input[type='number'] {
        height: 1.75rem;
        color: inherit;
        background: transparent;
        border: 1px solid dt('pdfeditor.border.color');
        border-radius: dt('pdfeditor.button.border.radius');
    }

    .p-pdfeditor-status {
        min-width: 4.5rem;
        text-align: center;
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
    }

    .p-pdfeditor-body {
        display: flex;
        flex: 1;
        min-height: 0;
    }

    .p-pdfeditor-sidebar {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: dt('pdfeditor.sidebar.width');
        padding: 0.75rem;
        overflow: auto;
        background: dt('pdfeditor.toolbar.background');
        border-inline-end: 1px solid dt('pdfeditor.border.color');
    }

    .p-pdfeditor-thumbnail {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem;
        font-size: 0.75rem;
        background: transparent;
        color: inherit;
        border: 2px solid transparent;
        border-radius: dt('pdfeditor.button.border.radius');
        cursor: pointer;
    }

    .p-pdfeditor-thumbnail canvas {
        max-width: 100%;
        background: #fff;
        box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
    }

    .p-pdfeditor-thumbnail-active {
        border-color: dt('pdfeditor.selection.color');
    }

    .p-pdfeditor-thumbnail-over {
        outline: 2px dashed dt('pdfeditor.selection.color');
    }

    .p-pdfeditor-stage {
        position: relative;
        flex: 1;
        min-width: 0;
        overflow: auto;
        padding: 1rem;
        background: dt('pdfeditor.stage.background');
    }

    .p-pdfeditor-page {
        position: relative;
        margin: 0 auto;
        background: #fff;
        box-shadow: 0 2px 8px rgb(0 0 0 / 0.35);
    }

    .p-pdfeditor-canvas {
        display: block;
    }

    .p-pdfeditor-overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
        user-select: none;
    }

    .p-pdfeditor-overlay[data-tool='select'] {
        cursor: default;
    }

    .p-pdfeditor-overlay:not([data-tool='select']) {
        cursor: crosshair;
    }

    .p-pdfeditor-readonly .p-pdfeditor-overlay {
        cursor: default;
        pointer-events: none;
    }

    .p-pdfeditor-fields {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .p-pdfeditor-field {
        position: absolute;
        box-sizing: border-box;
        margin: 0;
        padding: 0 2px;
        pointer-events: auto;
        color: #000;
        background: rgb(0 120 255 / 0.12);
        border: 1px solid rgb(0 120 255 / 0.5);
        font: inherit;
    }

    .p-pdfeditor-field:focus-visible {
        outline: 2px solid dt('pdfeditor.selection.color');
        background: rgb(255 255 255 / 0.9);
    }

    textarea.p-pdfeditor-field {
        resize: none;
        padding: 2px;
    }

    .p-pdfeditor-text-editor {
        position: absolute;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        overflow: hidden;
        resize: none;
        background: rgb(255 255 255 / 0.85);
        border: 1px dashed dt('pdfeditor.selection.color');
        outline: none;
        line-height: 1.2;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
    }

    .p-pdfeditor-handle {
        fill: #fff;
        stroke: dt('pdfeditor.selection.color');
        stroke-width: 1.5;
    }

    .p-pdfeditor-selection {
        fill: none;
        stroke: dt('pdfeditor.selection.color');
        stroke-width: 1;
        stroke-dasharray: 4 3;
        pointer-events: none;
    }

    .p-pdfeditor-empty-message {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        opacity: 0.6;
    }
`;
