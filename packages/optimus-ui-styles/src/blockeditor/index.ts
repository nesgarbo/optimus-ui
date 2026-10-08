export const style = /*css*/ `
    .p-blockeditor {
        position: relative;
        display: block;
        background: dt('blockeditor.background');
        color: dt('blockeditor.color');
        border: 1px solid dt('blockeditor.border.color');
        border-radius: dt('blockeditor.border.radius');
    }

    .p-blockeditor-focused {
        border-color: dt('blockeditor.focus.border.color');
    }

    .p-blockeditor-invalid {
        border-color: dt('blockeditor.invalid.border.color');
    }

    .p-blockeditor.p-disabled {
        opacity: dt('blockeditor.disabled.opacity');
        pointer-events: none;
    }

    .p-blockeditor-content {
        min-height: dt('blockeditor.min.height');
        padding: dt('blockeditor.padding');
    }

    .p-blockeditor-content .ProseMirror {
        min-height: inherit;
        outline: none;
        line-height: 1.6;
        overflow-wrap: anywhere;
    }

    .p-blockeditor-content .ProseMirror > * + * {
        margin-top: 0.5em;
    }

    .p-blockeditor-content .ProseMirror p.is-empty::before,
    .p-blockeditor-content .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
        color: dt('blockeditor.placeholder.color');
    }

    .p-blockeditor-content h1 {
        font-size: 2em;
        font-weight: 700;
        line-height: 1.25;
        margin-top: 1em;
    }

    .p-blockeditor-content h2 {
        font-size: 1.5em;
        font-weight: 700;
        line-height: 1.3;
        margin-top: 0.9em;
    }

    .p-blockeditor-content h3 {
        font-size: 1.25em;
        font-weight: 600;
        line-height: 1.35;
        margin-top: 0.8em;
    }

    .p-blockeditor-content ul,
    .p-blockeditor-content ol {
        padding-inline-start: 1.5rem;
    }

    .p-blockeditor-content ul {
        list-style: disc;
    }

    .p-blockeditor-content ol {
        list-style: decimal;
    }

    .p-blockeditor-content ul[data-type='taskList'] {
        list-style: none;
        padding-inline-start: 0.25rem;
    }

    .p-blockeditor-content ul[data-type='taskList'] li {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .p-blockeditor-content ul[data-type='taskList'] li > label {
        flex: none;
        margin-top: 0.3em;
    }

    .p-blockeditor-content ul[data-type='taskList'] li > div {
        flex: 1;
    }

    .p-blockeditor-content ul[data-type='taskList'] li[data-checked='true'] > div {
        text-decoration: line-through;
        opacity: 0.6;
    }

    .p-blockeditor-content blockquote {
        padding-inline-start: 1rem;
        border-inline-start: 3px solid dt('blockeditor.quote.border.color');
        opacity: 0.85;
    }

    .p-blockeditor-content code {
        padding: 0.1em 0.3em;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
        background: dt('blockeditor.code.background');
        border-radius: 0.25rem;
    }

    .p-blockeditor-content pre {
        padding: 0.75rem 1rem;
        overflow-x: auto;
        background: dt('blockeditor.code.background');
        border-radius: dt('blockeditor.border.radius');
    }

    .p-blockeditor-content pre code {
        padding: 0;
        background: none;
    }

    .p-blockeditor-content hr {
        margin: 1.25em 0;
        border: 0;
        border-top: 1px solid dt('blockeditor.border.color');
    }

    .p-blockeditor-content a {
        color: dt('blockeditor.link.color');
        text-decoration: underline;
        cursor: pointer;
    }

    .p-blockeditor-content img {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: dt('blockeditor.border.radius');
    }

    .p-blockeditor-content img.ProseMirror-selectednode {
        outline: 2px solid dt('blockeditor.focus.border.color');
    }

    .p-blockeditor-bubble {
        position: absolute;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 0.125rem;
        padding: 0.25rem;
        transform: translate(-50%, -100%);
        background: dt('blockeditor.overlay.background');
        color: dt('blockeditor.color');
        border: 1px solid dt('blockeditor.border.color');
        border-radius: dt('blockeditor.border.radius');
        box-shadow: dt('blockeditor.overlay.shadow');
    }

    .p-blockeditor-bubble-button {
        min-width: 1.75rem;
        height: 1.75rem;
        padding: 0 0.375rem;
        color: inherit;
        background: transparent;
        border: 0;
        border-radius: 0.25rem;
        font: inherit;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .p-blockeditor-bubble-button:hover {
        background: dt('blockeditor.item.hover.background');
    }

    .p-blockeditor-bubble-button-active {
        background: dt('blockeditor.item.active.background');
        color: dt('blockeditor.item.active.color');
    }

    .p-blockeditor-bubble input {
        height: 1.75rem;
        width: 12rem;
        padding: 0 0.5rem;
        color: inherit;
        background: transparent;
        border: 1px solid dt('blockeditor.border.color');
        border-radius: 0.25rem;
    }

    .p-blockeditor-slash {
        position: absolute;
        z-index: 10;
        width: 16rem;
        max-height: 18rem;
        padding: 0.25rem;
        overflow-y: auto;
        background: dt('blockeditor.overlay.background');
        color: dt('blockeditor.color');
        border: 1px solid dt('blockeditor.border.color');
        border-radius: dt('blockeditor.border.radius');
        box-shadow: dt('blockeditor.overlay.shadow');
    }

    .p-blockeditor-slash-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        width: 100%;
        padding: 0.375rem 0.5rem;
        text-align: start;
        color: inherit;
        background: transparent;
        border: 0;
        border-radius: 0.25rem;
        font: inherit;
        cursor: pointer;
    }

    .p-blockeditor-slash-item-active {
        background: dt('blockeditor.item.hover.background');
    }

    .p-blockeditor-slash-icon {
        display: inline-flex;
        flex: none;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        font-size: 0.8125rem;
        font-weight: 600;
        border: 1px solid dt('blockeditor.border.color');
        border-radius: 0.25rem;
    }

    .p-blockeditor-slash-text small {
        display: block;
        opacity: 0.65;
    }

    .p-blockeditor-slash-empty {
        padding: 0.5rem;
        opacity: 0.65;
    }
`;
