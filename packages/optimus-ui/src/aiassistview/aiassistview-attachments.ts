import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type { AssistAttachment, AssistAttachmentOptions } from '@openng/optimus-ui/types/aiassistview';
import { assistId } from './aiassistview-state';

/**
 * Turning picked, dropped and pasted files into attachments, and — when a `saveUrl` is configured —
 * putting them somewhere.
 *
 * Upload is deliberately optional. Most assistants hand the file to the model through their own API
 * call and never want a second one; those leave `saveUrl` unset and the attachment stays local, with
 * its `File` intact for the application to send however it likes.
 *
 * @module aiassistview-attachments
 */

/** Why a file was turned away. @group Types */
export type AssistRejectionReason = 'type' | 'size' | 'count';

/** A file the rules would not take. @group Interface */
export interface AssistRejection {
    /** The file. */
    file: File;
    /** Which rule turned it away. */
    reason: AssistRejectionReason;
}

/** What {@link AssistAttachments.accept} decided. @group Interface */
export interface AssistAcceptResult {
    /** The files that passed. */
    accepted: AssistAttachment[];
    /** The files that did not, and why. */
    rejected: AssistRejection[];
}

/**
 * One assistant's attachment handling.
 *
 * @group Service
 */
@Injectable()
export class AssistAttachments {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly document = inject(DOCUMENT);

    /** Object URLs this service minted, so they can be revoked rather than leaked. */
    private readonly objectUrls = new Set<string>();

    /**
     * Runs the rules over a list of picked files.
     *
     * `existingCount` is passed in rather than read from the state because the same rules apply to a
     * drop landing on the transcript, a paste into the editor and a pick from the dialog, and only
     * the caller knows which tray the files are heading for.
     */
    accept(files: FileList | File[], options: AssistAttachmentOptions, existingCount: number): AssistAcceptResult {
        const accepted: AssistAttachment[] = [];
        const rejected: AssistRejection[] = [];
        const limit = options.maximumCount ?? 5;

        for (const file of Array.from(files)) {
            if (existingCount + accepted.length >= limit) {
                rejected.push({ file, reason: 'count' });
                continue;
            }

            if (!this.typeAllowed(file, options.allowedFileTypes)) {
                rejected.push({ file, reason: 'type' });
                continue;
            }

            if (options.maxFileSize != null && file.size > options.maxFileSize) {
                rejected.push({ file, reason: 'size' });
                continue;
            }

            accepted.push(this.toAttachment(file, options));
        }

        return { accepted, rejected };
    }

    /** Wraps one browser file as an attachment, with a preview URL when it is an image. */
    toAttachment(file: File, options: AssistAttachmentOptions): AssistAttachment {
        const attachment: AssistAttachment = {
            id: assistId('file'),
            name: file.name,
            size: file.size,
            type: file.type,
            status: options.saveUrl ? 'pending' : 'uploaded',
            progress: options.saveUrl ? 0 : 100,
            file
        };

        if ((options.showPreview ?? true) && file.type.startsWith('image/') && isPlatformBrowser(this.platformId)) {
            const url = URL.createObjectURL(file);

            this.objectUrls.add(url);
            attachment.url = url;
        }

        return attachment;
    }

    /**
     * POSTs one attachment to `saveUrl`, reporting progress as it goes.
     *
     * `XMLHttpRequest` and not `fetch`, because upload progress is the whole point of showing a bar
     * and `fetch` still cannot report it.
     */
    upload(attachment: AssistAttachment, options: AssistAttachmentOptions, onProgress: (changes: Partial<AssistAttachment>) => void): void {
        const saveUrl = options.saveUrl;

        if (!saveUrl || !attachment.file || !isPlatformBrowser(this.platformId)) return;

        const request = new XMLHttpRequest();
        const body = new FormData();

        body.append('files', attachment.file, attachment.name);

        request.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;

            onProgress({ status: 'uploading', progress: Math.round((event.loaded / event.total) * 100) });
        };

        request.onload = () => {
            if (request.status >= 200 && request.status < 300) {
                onProgress({ status: 'uploaded', progress: 100, data: safeJson(request.responseText) });
            } else {
                onProgress({ status: 'failed', error: `${request.status} ${request.statusText}` });
            }
        };

        request.onerror = () => onProgress({ status: 'failed', error: 'network' });

        request.open('POST', saveUrl, true);
        request.send(body);
    }

    /** Tells the server an attachment is gone, when a `removeUrl` is configured. */
    remove(attachment: AssistAttachment, options: AssistAttachmentOptions): void {
        this.revoke(attachment);

        if (!options.removeUrl || !isPlatformBrowser(this.platformId)) return;

        const body = new FormData();

        body.append('files', attachment.name ?? '');

        void fetch(options.removeUrl, { method: 'POST', body }).catch(() => {
            // A failed cleanup call is not something to put in front of the reader: the attachment is
            // already out of their message, and the server will collect the orphan itself.
        });
    }

    /** Opens the file dialog and reports what came back. */
    pick(options: AssistAttachmentOptions, onPicked: (files: FileList) => void): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const input = this.document.createElement('input');

        input.type = 'file';
        input.multiple = (options.maximumCount ?? 5) > 1;
        input.style.display = 'none';

        if (options.allowedFileTypes) input.accept = options.allowedFileTypes;

        input.addEventListener('change', () => {
            if (input.files?.length) onPicked(input.files);

            input.remove();
        });

        this.document.body.appendChild(input);
        input.click();
    }

    /** Releases one attachment's preview URL. */
    revoke(attachment: AssistAttachment): void {
        if (!attachment.url || !this.objectUrls.has(attachment.url)) return;

        URL.revokeObjectURL(attachment.url);
        this.objectUrls.delete(attachment.url);
    }

    /**
     * Releases every preview URL this service minted.
     *
     * Called when the root is destroyed. Without it a long conversation with images holds every one
     * of them in memory for the life of the document, since an object URL is only collected when it
     * is revoked.
     */
    dispose(): void {
        for (const url of this.objectUrls) URL.revokeObjectURL(url);

        this.objectUrls.clear();
    }

    /** Whether a file matches the `accept` list, in `<input accept>` syntax. */
    private typeAllowed(file: File, allowed: string | undefined): boolean {
        if (!allowed?.trim()) return true;

        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();

        return allowed
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean)
            .some((entry) => {
                if (entry.startsWith('.')) return name.endsWith(entry);
                if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));

                return type === entry;
            });
    }
}

/** Parses a response body, or hands back the raw text when it is not JSON. @internal */
function safeJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
