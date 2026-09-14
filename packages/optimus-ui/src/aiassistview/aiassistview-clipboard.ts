/**
 * Putting text on the clipboard from a surface that may be running anywhere.
 *
 * `navigator.clipboard` is unavailable on an insecure origin and in some embedded webviews, which is
 * exactly where an assistant docked inside a desktop shell tends to run. The fallback is the old
 * hidden-textarea trick, kept because a copy button that silently does nothing is worse than a
 * deprecated API.
 *
 * @module aiassistview-clipboard
 */

/**
 * Copies `text`, and reports whether it landed.
 *
 * @group Function
 */
export async function copyToClipboard(document: Document, text: string): Promise<boolean> {
    if (!text) return false;

    const view = document.defaultView;

    if (view?.navigator?.clipboard?.writeText) {
        try {
            await view.navigator.clipboard.writeText(text);

            return true;
        } catch {
            // Falls through: a rejected permission or a webview without the API both land here, and
            // the textarea path still works in both.
        }
    }

    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute('readonly', '');
    // Off-screen rather than `display:none`, because a hidden element cannot be selected.
    textarea.style.cssText = 'position:fixed;inset-block-start:-9999px;opacity:0';
    document.body.appendChild(textarea);

    try {
        textarea.select();

        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        textarea.remove();
    }
}
