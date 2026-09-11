import { Injectable, signal } from '@angular/core';

export interface DocResource {
    label: string;
    tab: number;
    /** Shown next to the label — the open issue count, when there is one. */
    badge?: string;
}

/**
 * State shared by a documentation page and the rail on its right.
 *
 * The panels of a page — features, API, theming, pass through — are picked from the rail
 * rather than from a tab bar above the content, so the page starts at its heading and the
 * list of panels sits with the section index a reader is already scanning.
 */
@Injectable()
export class AppDocService {
    activeTab = signal<number>(0);

    currentHeader = signal<string>('');

    /** The panels this page actually has. */
    resources = signal<DocResource[]>([]);

    /** What "Copy Markdown" in the rail should copy. */
    componentName = signal<string>('');

    docType = signal<'component' | 'page'>('component');
}
