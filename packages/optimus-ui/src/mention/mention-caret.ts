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

interface Mirror {
    element: HTMLDivElement;
    marker: HTMLSpanElement;
    /** The size of the field when its styles were copied: a change means they may be stale. */
    key: string;
    lineHeight: number;
    borderLeft: number;
    borderTop: number;
}

/** One mirror per field, kept between keystrokes: building it is the costly part, and the text is all that changes. */
const MIRRORS = new WeakMap<Element, Mirror>();

/** Takes away the mirror of a field, once the list is closed. */
export function disposeCaretMirror(field: Element): void {
    MIRRORS.get(field)?.element.remove();
    MIRRORS.delete(field);
}

/** The caret of a text field, at character offset `position`. */
export function textFieldCaret(field: HTMLInputElement | HTMLTextAreaElement, position: number): CaretRect {
    const doc = field.ownerDocument;
    const isInput = field.nodeName === 'INPUT';
    const key = `${field.offsetWidth}x${field.offsetHeight}`;
    let mirror = MIRRORS.get(field);

    if (!mirror || mirror.key !== key || !mirror.element.isConnected) {
        mirror?.element.remove();
        const style = getComputedStyle(field);

        const element = doc.createElement('div');

        for (const prop of COPIED) (element.style as any)[prop] = (style as any)[prop];

        element.style.position = 'absolute';
        element.style.visibility = 'hidden';
        element.style.top = '0';
        element.style.left = '-9999px';
        element.style.whiteSpace = isInput ? 'nowrap' : 'pre-wrap';
        element.style.wordWrap = 'break-word';
        element.setAttribute('aria-hidden', 'true');

        mirror = {
            element,
            marker: doc.createElement('span'),
            key,
            lineHeight: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 16,
            borderLeft: parseFloat(style.borderLeftWidth) || 0,
            borderTop: parseFloat(style.borderTopWidth) || 0
        };
        element.appendChild(doc.createTextNode(''));
        element.appendChild(mirror.marker);
        doc.body.appendChild(element);
        MIRRORS.set(field, mirror);
    }

    // The text before the caret, and the marker that holds the rest and sits where the caret does.
    (mirror.element.firstChild as Text).data = field.value.slice(0, position);
    // A dot keeps the marker on the line the text ends on.
    mirror.marker.textContent = field.value.slice(position) || '.';

    const rect = field.getBoundingClientRect();
    const left = rect.left + mirror.marker.offsetLeft + mirror.borderLeft - field.scrollLeft;
    const top = rect.top + mirror.marker.offsetTop + mirror.borderTop - field.scrollTop;

    return { left: Math.min(Math.max(left, rect.left), rect.right), top, bottom: top + mirror.lineHeight };
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
