/**
 * Where the caret is on screen, for the list to open beside it.
 *
 * A `<textarea>` or `<input>` does not expose the position of its caret, so a hidden mirror element
 * with the same text metrics is laid out and a marker in it is measured. A `contenteditable` host
 * answers through its selection range.
 *
 * @module mention-caret
 */

/** A caret position in viewport pixels. */
export interface CaretRect {
    left: number;
    top: number;
    bottom: number;
}

const COPIED = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize'
] as const;

/** The caret of a text field, at character offset `position`. */
export function textFieldCaret(field: HTMLInputElement | HTMLTextAreaElement, position: number): CaretRect {
    const doc = field.ownerDocument;
    const style = getComputedStyle(field);
    const mirror = doc.createElement('div');
    const isInput = field.nodeName === 'INPUT';

    for (const prop of COPIED) (mirror.style as any)[prop] = (style as any)[prop];

    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.top = '0';
    mirror.style.left = '-9999px';
    mirror.style.whiteSpace = isInput ? 'nowrap' : 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.textContent = field.value.slice(0, position);

    const marker = doc.createElement('span');

    // A zero-width space keeps the marker on the line the text ends on.
    marker.textContent = field.value.slice(position) || '.';
    mirror.appendChild(marker);
    doc.body.appendChild(mirror);

    const rect = field.getBoundingClientRect();
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 16;
    const left = rect.left + marker.offsetLeft + parseFloat(style.borderLeftWidth) - field.scrollLeft;
    const top = rect.top + marker.offsetTop + parseFloat(style.borderTopWidth) - field.scrollTop;

    doc.body.removeChild(mirror);

    return { left: Math.min(Math.max(left, rect.left), rect.right), top, bottom: top + lineHeight };
}

/** The caret of a `contenteditable` host, from its current selection. */
export function selectionCaret(doc: Document): CaretRect | null {
    const selection = doc.getSelection();

    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0).cloneRange();

    range.collapse(true);

    const rects = range.getClientRects();
    const rect = rects.length ? rects[0] : range.getBoundingClientRect();

    // A collapsed range at the start of a line can report an all-zero rect: fall back to its container.
    if (!rect.width && !rect.height && !rect.left && !rect.top) {
        const node = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
        const box = node?.getBoundingClientRect();

        return box ? { left: box.left, top: box.top, bottom: box.bottom } : null;
    }

    return { left: rect.left, top: rect.top, bottom: rect.bottom };
}
