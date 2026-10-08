import { isPlatformBrowser } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    model,
    NgModule,
    numberAttribute,
    output,
    PLATFORM_ID,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { SharedModule } from '@openng/optimus-ui/api';
import { BaseComponent, PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { Bind } from '@openng/optimus-ui/bind';
import type { PdfAnnotation, PdfAnnotationInput, PdfChangeEvent, PdfFailedEvent, PdfFontFamily, PdfFormField, PdfFormValues, PdfImageAnnotation, PdfLoadedEvent, PdfPageInfo, PdfEditorPassThrough, PdfTool } from '@openng/optimus-ui/types/pdfeditor';
import type { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ASCENT, boundsOf, isBoxed, moveAnnotation, nextAnnotationId, pickAnnotation, resizeAnnotation, type Box } from './pdf-model';
import { openDocument, renderPage, type PageRender } from './pdf-render';
import { createTextMeasurer, deletePage, exportPdf, extractPages, insertBlankPage, LINE_HEIGHT, loadPdf, looksLikePdf, mergePdf, movePage, pageInfos, readForm, rotatePage, TEXT_PADDING, wrapText, type TextMeasurer } from './pdf-writer';
import { PdfEditorStyle } from './style/pdfeditorstyle';

/** Where the PDF can come from. */
export type PdfSource = string | URL | Blob | ArrayBuffer | Uint8Array | null | undefined;

/** A snapshot to go back to. */
interface Snapshot {
    annotations: PdfAnnotation[];
    bytes: Uint8Array;
    page: number;
}

/** What the pointer is doing between pointer down and pointer up. */
type Gesture =
    | { kind: 'move'; id: string; start: [number, number]; original: PdfAnnotation; moved: boolean }
    | { kind: 'resize'; id: string; handle: string; original: PdfAnnotation; moved: boolean }
    | { kind: 'endpoint'; id: string; end: 1 | 2; original: PdfAnnotation; moved: boolean }
    | { kind: 'create'; start: [number, number] }
    | { kind: 'ink' };

const ICONS: Record<string, string> = {
    select: 'M5 3l14 8-6 2-2 6z',
    text: 'M5 6V4h14v2M12 4v16M9 20h6',
    highlight: 'M4 21h16M7 17l8-9 3 3-7 9H7z',
    rectangle: 'M4 6h16v12H4z',
    ellipse: 'M3 12a9 6 0 1 0 18 0a9 6 0 1 0-18 0',
    line: 'M5 19L19 5',
    arrow: 'M5 19L19 5M10 5h9v9',
    draw: 'M4 20l4-1 11-11-3-3L5 16z',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
    signature: 'M3 17c3-6 5-10 7-8s-2 7 1 7 3-5 5-5 2 3 5 2M3 21h18',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
    redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3',
    zoomIn: 'M11 4a7 7 0 1 0 .01 0zM21 21l-5-5M11 8v6M8 11h6',
    zoomOut: 'M11 4a7 7 0 1 0 .01 0zM21 21l-5-5M8 11h6',
    fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    rotate: 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    pageAdd: 'M6 3h9l4 4v14H6zM12 11v6M9 14h6',
    merge: 'M3 7h8v10H3zM13 7h8v10h-8z',
    save: 'M12 3v12M7 10l5 5 5-5M5 21h14',
    prev: 'M15 5l-7 7 7 7',
    next: 'M9 5l7 7-7 7',
    sidebar: 'M4 4h16v16H4zM9 4v16',
    remove: 'M6 6l12 12M18 6L6 18'
};

const TOOLS: { tool: PdfTool; label: string }[] = [
    { tool: 'select', label: 'Select' },
    { tool: 'text', label: 'Text' },
    { tool: 'highlight', label: 'Highlight' },
    { tool: 'rectangle', label: 'Rectangle' },
    { tool: 'ellipse', label: 'Ellipse' },
    { tool: 'line', label: 'Line' },
    { tool: 'arrow', label: 'Arrow' },
    { tool: 'draw', label: 'Draw' },
    { tool: 'image', label: 'Image' },
    { tool: 'signature', label: 'Signature' }
];

const CSS_FONTS: Record<PdfFontFamily, string> = {
    helvetica: 'Helvetica, Arial, sans-serif',
    times: '"Times New Roman", Times, serif',
    courier: '"Courier New", Courier, monospace'
};

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;
const HISTORY_LIMIT = 50;

/**
 * PdfEditor edits PDF documents: it draws annotations on pages, fills in forms, and turns, deletes, moves, adds and merges pages.
 *
 * Pages are drawn with pdf.js and changed with pdf-lib, both optional peer dependencies. The annotations are the `annotations`
 * model, in PDF points from the top left of the page as it is shown, so they can be read, saved and restored by the app.
 * `save` makes a new file with the annotations written into the pages and the form filled in; the original is not touched.
 *
 * Annotations cover text, highlights, rectangles, ellipses, lines, arrows, freehand drawing and pictures, and a signature is a
 * picture: drawing one with `p-signature` and passing its value as `signature` places it with the signature tool.
 *
 * @group Components
 */
@Component({
    selector: 'p-pdfeditor',
    standalone: true,
    imports: [SharedModule, Bind],
    template: `
        @if (toolbar()) {
            <div [class]="cx('toolbar')" role="toolbar" aria-label="PDF tools" [pBind]="ptm('toolbar')">
                <div [class]="cx('toolbarGroup')">
                    <button type="button" [class]="cx('button', { pressed: sidebarOpen() })" title="Thumbnails" aria-label="Thumbnails" [attr.aria-pressed]="sidebarOpen()" (click)="sidebarOpen.set(!sidebarOpen())">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['sidebar']" /></svg>
                    </button>
                    <button type="button" [class]="cx('button')" title="Previous page" aria-label="Previous page" [disabled]="pageIndex() <= 0" (click)="goTo(pageIndex() - 1)">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['prev']" /></svg>
                    </button>
                    <span class="p-pdfeditor-status" aria-live="polite">{{ pages().length ? pageIndex() + 1 : 0 }} / {{ pages().length }}</span>
                    <button type="button" [class]="cx('button')" title="Next page" aria-label="Next page" [disabled]="pageIndex() >= pages().length - 1" (click)="goTo(pageIndex() + 1)">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['next']" /></svg>
                    </button>
                </div>
                <div [class]="cx('toolbarGroup')">
                    <button type="button" [class]="cx('button')" title="Zoom out" aria-label="Zoom out" (click)="zoomOut()">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['zoomOut']" /></svg>
                    </button>
                    <span class="p-pdfeditor-status">{{ (scale() * 100).toFixed(0) }}%</span>
                    <button type="button" [class]="cx('button')" title="Zoom in" aria-label="Zoom in" (click)="zoomIn()">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['zoomIn']" /></svg>
                    </button>
                    <button type="button" [class]="cx('button')" title="Fit width" aria-label="Fit width" (click)="fitWidth()">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['fit']" /></svg>
                    </button>
                </div>
                @if (!readonly()) {
                    <div [class]="cx('toolbarGroup')" role="radiogroup" aria-label="Tool">
                        @for (item of tools; track item.tool) {
                            <button type="button" [class]="cx('button', { pressed: tool() === item.tool })" role="radio" [title]="item.label" [attr.aria-label]="item.label" [attr.aria-checked]="tool() === item.tool" (click)="setTool(item.tool)">
                                <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons[item.tool]" /></svg>
                            </button>
                        }
                    </div>
                    <div [class]="cx('toolbarGroup')">
                        <input type="color" title="Colour" aria-label="Colour" [value]="color()" (input)="setColor($any($event.target).value)" />
                        <select title="Line width" aria-label="Line width" [value]="strokeWidth()" (change)="strokeWidth.set(+$any($event.target).value)">
                            @for (w of widths; track w) {
                                <option [value]="w" [selected]="w === strokeWidth()">{{ w }} pt</option>
                            }
                        </select>
                        <select title="Font size" aria-label="Font size" (change)="setFontSize(+$any($event.target).value)">
                            @for (s of sizes; track s) {
                                <option [value]="s" [selected]="s === fontSize()">{{ s }}</option>
                            }
                        </select>
                        <select title="Font" aria-label="Font" (change)="setFontFamily($any($event.target).value)">
                            <option value="helvetica" [selected]="fontFamily() === 'helvetica'">Helvetica</option>
                            <option value="times" [selected]="fontFamily() === 'times'">Times</option>
                            <option value="courier" [selected]="fontFamily() === 'courier'">Courier</option>
                        </select>
                    </div>
                    <div [class]="cx('toolbarGroup')">
                        <button type="button" [class]="cx('button')" title="Undo" aria-label="Undo" [disabled]="!canUndo()" (click)="undo()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['undo']" /></svg>
                        </button>
                        <button type="button" [class]="cx('button')" title="Redo" aria-label="Redo" [disabled]="!canRedo()" (click)="redo()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['redo']" /></svg>
                        </button>
                        <button type="button" [class]="cx('button')" title="Delete selected" aria-label="Delete selected" [disabled]="!selectedId()" (click)="removeSelected()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['remove']" /></svg>
                        </button>
                    </div>
                    <div [class]="cx('toolbarGroup')">
                        <button type="button" [class]="cx('button')" title="Rotate page" aria-label="Rotate page" [disabled]="!pages().length" (click)="rotateCurrentPage(90)">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['rotate']" /></svg>
                        </button>
                        <button type="button" [class]="cx('button')" title="Add a blank page" aria-label="Add a blank page" [disabled]="!pages().length" (click)="addBlankPage()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['pageAdd']" /></svg>
                        </button>
                        <button type="button" [class]="cx('button')" title="Merge another PDF" aria-label="Merge another PDF" [disabled]="!pages().length" (click)="mergeInput().nativeElement.click()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['merge']" /></svg>
                        </button>
                        <button type="button" [class]="cx('button')" title="Delete page" aria-label="Delete page" [disabled]="pages().length < 2" (click)="deleteCurrentPage()">
                            <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['trash']" /></svg>
                        </button>
                    </div>
                }
                <div [class]="cx('toolbarGroup')">
                    <button type="button" [class]="cx('button')" title="Save" aria-label="Save" [disabled]="!pages().length" (click)="download()">
                        <svg class="p-pdfeditor-icon" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="icons['save']" /></svg>
                    </button>
                </div>
            </div>
        }
        <div [class]="cx('body')">
            @if (sidebar() && sidebarOpen()) {
                <nav [class]="cx('sidebar')" aria-label="Pages" [pBind]="ptm('sidebar')">
                    @for (p of pages(); track p.index) {
                        <button
                            type="button"
                            [class]="cx('thumbnail', { active: p.index === pageIndex() })"
                            [class.p-pdfeditor-thumbnail-over]="dropTarget() === p.index"
                            [attr.aria-label]="'Page ' + (p.index + 1)"
                            [attr.aria-current]="p.index === pageIndex() ? 'page' : null"
                            [draggable]="!readonly()"
                            (click)="goTo(p.index)"
                            (dragstart)="onDragStart($event, p.index)"
                            (dragover)="onDragOver($event, p.index)"
                            (dragleave)="dropTarget.set(-1)"
                            (drop)="onDrop($event, p.index)"
                            (dragend)="dropTarget.set(-1)"
                        >
                            <canvas data-thumbnail [attr.data-index]="p.index"></canvas>
                            <span>{{ p.index + 1 }}</span>
                        </button>
                    }
                </nav>
            }
            <div #stage [class]="cx('stage')" [pBind]="ptm('stage')" (keydown)="onKeydown($event)" tabindex="-1">
                @if (!pages().length) {
                    <div class="p-pdfeditor-empty-message">{{ loading() ? 'Loading…' : failure() || 'No document' }}</div>
                }
                <div [class]="cx('page')" [hidden]="!pages().length" [style.width.px]="pixelWidth()" [style.height.px]="pixelHeight()">
                    <canvas #canvas [class]="cx('canvas')" role="img" [attr.aria-label]="'Page ' + (pageIndex() + 1) + ' of ' + pages().length"></canvas>
                    @if (current(); as page) {
                        <svg
                            #overlay
                            [class]="cx('overlay')"
                            [attr.data-tool]="tool()"
                            [attr.viewBox]="'0 0 ' + page.width + ' ' + page.height"
                            [attr.width]="pixelWidth()"
                            [attr.height]="pixelHeight()"
                            (pointerdown)="onPointerDown($event)"
                            (pointermove)="onPointerMove($event)"
                            (pointerup)="onPointerUp($event)"
                            (pointercancel)="onPointerUp($event)"
                            (dblclick)="onDoubleClick($event)"
                        >
                            @for (a of drawn(); track a.id) {
                                <g [attr.data-annotation]="a.id" [attr.data-type]="a.type" [attr.opacity]="a.id === editingId() ? 0 : null">
                                    @switch (a.type) {
                                        @case ('text') {
                                            <text [attr.font-size]="a.fontSize" [attr.font-family]="cssFont(a.fontFamily)" [attr.fill]="a.color">
                                                @for (line of textLines(a); track $index) {
                                                    <tspan [attr.x]="a.x + textPadding" [attr.y]="a.y + textPadding + ascent(a) + $index * a.fontSize * lineHeight">{{ line }}</tspan>
                                                }
                                            </text>
                                        }
                                        @case ('highlight') {
                                            <rect [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height" [attr.fill]="a.color" [attr.fill-opacity]="a.opacity" style="mix-blend-mode: multiply" />
                                        }
                                        @case ('rectangle') {
                                            <rect
                                                [attr.x]="a.x"
                                                [attr.y]="a.y"
                                                [attr.width]="a.width"
                                                [attr.height]="a.height"
                                                [attr.stroke]="a.strokeWidth > 0 ? a.color : 'none'"
                                                [attr.stroke-width]="a.strokeWidth"
                                                [attr.fill]="a.fillColor || 'none'"
                                                [attr.fill-opacity]="a.fillOpacity"
                                            />
                                        }
                                        @case ('ellipse') {
                                            <ellipse
                                                [attr.cx]="a.x + a.width / 2"
                                                [attr.cy]="a.y + a.height / 2"
                                                [attr.rx]="a.width / 2"
                                                [attr.ry]="a.height / 2"
                                                [attr.stroke]="a.strokeWidth > 0 ? a.color : 'none'"
                                                [attr.stroke-width]="a.strokeWidth"
                                                [attr.fill]="a.fillColor || 'none'"
                                                [attr.fill-opacity]="a.fillOpacity"
                                            />
                                        }
                                        @case ('line') {
                                            <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2" [attr.stroke]="a.color" [attr.stroke-width]="a.strokeWidth" stroke-linecap="round" />
                                        }
                                        @case ('arrow') {
                                            <path [attr.d]="arrowPath(a)" [attr.stroke]="a.color" [attr.stroke-width]="a.strokeWidth" stroke-linecap="round" fill="none" />
                                        }
                                        @case ('draw') {
                                            @if (a.points.length === 1) {
                                                <circle [attr.cx]="a.points[0][0]" [attr.cy]="a.points[0][1]" [attr.r]="a.strokeWidth / 2" [attr.fill]="a.color" />
                                            } @else {
                                                <path [attr.d]="inkPath(a.points)" [attr.stroke]="a.color" [attr.stroke-width]="a.strokeWidth" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                                            }
                                        }
                                        @case ('image') {
                                            <image [attr.href]="a.dataUrl" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height" preserveAspectRatio="none" />
                                        }
                                        @case ('signature') {
                                            <image [attr.href]="a.dataUrl" [attr.x]="a.x" [attr.y]="a.y" [attr.width]="a.width" [attr.height]="a.height" preserveAspectRatio="none" />
                                        }
                                    }
                                </g>
                            }
                            @if (selection(); as s) {
                                <rect class="p-pdfeditor-selection" [attr.x]="s.box.x" [attr.y]="s.box.y" [attr.width]="s.box.width" [attr.height]="s.box.height" />
                                @if (!readonly() && !editingId()) {
                                    @for (h of s.handles; track h.name) {
                                        <rect
                                            class="p-pdfeditor-handle"
                                            [attr.data-handle]="h.name"
                                            [attr.x]="h.x - handleSize / 2"
                                            [attr.y]="h.y - handleSize / 2"
                                            [attr.width]="handleSize"
                                            [attr.height]="handleSize"
                                            [style.cursor]="h.cursor"
                                            (pointerdown)="onHandleDown($event, h.name)"
                                        />
                                    }
                                }
                            }
                        </svg>
                        @if (editing(); as e) {
                            <textarea
                                #textEditor
                                [class]="cx('editor')"
                                [style.left.px]="e.x * scale()"
                                [style.top.px]="e.y * scale()"
                                [style.width.px]="e.width * scale()"
                                [style.height.px]="e.height * scale()"
                                [style.padding.px]="textPadding * scale()"
                                [style.font-size.px]="e.fontSize * scale()"
                                [style.font-family]="cssFont(e.fontFamily)"
                                [style.color]="e.color"
                                [value]="e.text"
                                aria-label="Text"
                                (blur)="commitText($any($event.target).value)"
                                (keydown)="onEditorKeydown($event)"
                            ></textarea>
                        }
                        <div [class]="cx('fields')">
                            @for (f of pageFields(); track $index) {
                                @switch (f.type) {
                                    @case ('text') {
                                        @if (f.multiline) {
                                            <textarea
                                                [class]="cx('field')"
                                                [style]="fieldStyle(f)"
                                                [attr.aria-label]="f.name"
                                                [disabled]="f.readOnly || readonly()"
                                                [value]="textValue(f)"
                                                (input)="setFormValue(f.name, $any($event.target).value)"
                                            ></textarea>
                                        } @else {
                                            <input
                                                type="text"
                                                [class]="cx('field')"
                                                [style]="fieldStyle(f)"
                                                [attr.aria-label]="f.name"
                                                [disabled]="f.readOnly || readonly()"
                                                [value]="textValue(f)"
                                                (input)="setFormValue(f.name, $any($event.target).value)"
                                            />
                                        }
                                    }
                                    @case ('checkbox') {
                                        <input
                                            type="checkbox"
                                            [class]="cx('field')"
                                            [style]="fieldStyle(f)"
                                            [attr.aria-label]="f.name"
                                            [disabled]="f.readOnly || readonly()"
                                            [checked]="formValue(f) === true"
                                            (change)="setFormValue(f.name, $any($event.target).checked)"
                                        />
                                    }
                                    @case ('radio') {
                                        <input
                                            type="radio"
                                            [class]="cx('field')"
                                            [style]="fieldStyle(f)"
                                            [attr.aria-label]="f.name + ': ' + f.option"
                                            [disabled]="f.readOnly || readonly()"
                                            [checked]="formValue(f) === f.option"
                                            (change)="setFormValue(f.name, f.option ?? '')"
                                        />
                                    }
                                    @case ('dropdown') {
                                        <select [class]="cx('field')" [style]="fieldStyle(f)" [attr.aria-label]="f.name" [disabled]="f.readOnly || readonly()" (change)="setFormValue(f.name, $any($event.target).value)">
                                            <option value="" [selected]="!formValue(f)"></option>
                                            @for (o of f.options; track o) {
                                                <option [value]="o" [selected]="formValue(f) === o">{{ o }}</option>
                                            }
                                        </select>
                                    }
                                    @case ('list') {
                                        <select [class]="cx('field')" [style]="fieldStyle(f)" multiple [attr.aria-label]="f.name" [disabled]="f.readOnly || readonly()" (change)="setFormValue(f.name, selectedOptions($any($event.target)))">
                                            @for (o of f.options; track o) {
                                                <option [value]="o" [selected]="listValue(f).includes(o)">{{ o }}</option>
                                            }
                                        </select>
                                    }
                                }
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
        <input #imageInput type="file" accept="image/png,image/jpeg" hidden (change)="onImagePicked($event)" />
        <input #mergeInput type="file" accept="application/pdf" hidden (change)="onMergePicked($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [PdfEditorStyle, { provide: PARENT_INSTANCE, useExisting: PdfEditor }],
    host: { '[class]': 'cx("root")', 'data-scope': 'pdfeditor', 'data-part': 'root', tabindex: '0', '(keydown)': 'onKeydown($event)' },
    hostDirectives: [Bind]
})
export class PdfEditor extends BaseComponent<PdfEditorPassThrough> {
    componentName = 'PdfEditor';

    /** @internal */
    _componentStyle = inject(PdfEditorStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
    private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');
    private readonly overlayRef = viewChild<ElementRef<SVGSVGElement>>('overlay');
    private readonly editorRef = viewChild<ElementRef<HTMLTextAreaElement>>('textEditor');
    protected readonly imageInput = viewChild.required<ElementRef<HTMLInputElement>>('imageInput');
    protected readonly mergeInput = viewChild.required<ElementRef<HTMLInputElement>>('mergeInput');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The document: a URL, a `Blob` or `File`, or the bytes of the file.
     * @group Props
     */
    readonly src = input<PdfSource>(null);
    /**
     * What is drawn on the pages. Supports `[(annotations)]`.
     * @group Props
     */
    readonly annotations = model<PdfAnnotation[]>([]);
    /**
     * The values of the form fields, by field name. Supports `[(formValues)]`. A field with no entry has the value the file gives it.
     * @group Props
     */
    readonly formValues = model<PdfFormValues>({});
    /**
     * The page that is shown, from 0. Supports `[(pageIndex)]`.
     * @group Props
     */
    readonly pageIndex = model(0);
    /**
     * Zoom: CSS pixels per point of the page. Supports `[(scale)]`.
     * @group Props
     */
    readonly scale = model(1);
    /**
     * What the pointer does on the page. Supports `[(tool)]`.
     * @group Props
     */
    readonly tool = model<PdfTool>('select');
    /**
     * Colour of what is drawn next, and of the selected annotation when it changes.
     * @group Props
     */
    readonly color = model('#e11d48');
    /**
     * Line width of what is drawn next, in points.
     * @group Props
     */
    readonly strokeWidth = model(2);
    /**
     * Size of the text written next, in points.
     * @group Props
     */
    readonly fontSize = model(14);
    /**
     * Font of the text written next.
     * @group Props
     */
    readonly fontFamily = model<PdfFontFamily>('helvetica');
    /**
     * Colour of a highlight.
     * @group Props
     */
    readonly highlightColor = input('#facc15');
    /**
     * Opacity of a highlight, from 0 to 1.
     * @group Props
     */
    readonly highlightOpacity = input(0.4, { transform: numberAttribute });
    /**
     * Fill of the rectangles and ellipses that are drawn next. Empty leaves them hollow.
     * @group Props
     */
    readonly fillColor = input('');
    /**
     * A signature as a PNG data URL, placed by the signature tool. Draw one with `p-signature`.
     * @group Props
     */
    readonly signature = input<string | null>(null);
    /**
     * Shows the toolbar.
     * @group Props
     */
    readonly toolbar = input(true, { transform: booleanAttribute });
    /**
     * Allows the sidebar of thumbnails.
     * @group Props
     */
    readonly sidebar = input(true, { transform: booleanAttribute });
    /**
     * Shows the sidebar of thumbnails. Supports `[(sidebarOpen)]`.
     * @group Props
     */
    readonly sidebarOpen = model(true);
    /**
     * Shows the document and its form, and lets nothing be changed.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Makes the form part of the pages when the file is saved, so it can no longer be filled in.
     * @group Props
     */
    readonly flatten = input(false, { transform: booleanAttribute });
    /**
     * Name of the file that `download` writes.
     * @group Props
     */
    readonly fileName = input('document.pdf');
    /**
     * Fits the page to the width of the editor when a document opens.
     * @group Props
     */
    readonly fitOnLoad = input(false, { transform: booleanAttribute });
    /**
     * URL of `pdf.worker.min.mjs` from `pdfjs-dist`, so that pdf.js works on a thread of its own. Without it the worker runs in the page.
     * @group Props
     */
    readonly workerSrc = input('');
    /**
     * Folder with the `cmaps`, `standard_fonts` and `wasm` folders of `pdfjs-dist`. Without it, a font that is not in the file is drawn in a similar one.
     * @group Props
     */
    readonly assetsUrl = input('');

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Emitted when a document is open.
     * @group Emits
     */
    readonly loaded = output<PdfLoadedEvent>();
    /**
     * Emitted when a document could not be opened.
     * @group Emits
     */
    readonly failed = output<PdfFailedEvent>();
    /**
     * Emitted when the annotations, the form or the pages change.
     * @group Emits
     */
    readonly changed = output<PdfChangeEvent>();
    /**
     * Emitted when the signature tool is used and there is no `signature`.
     * @group Emits
     */
    readonly signatureRequested = output<void>();
    /**
     * Emitted with the new file when `download` or `save` makes it.
     * @group Emits
     */
    readonly saved = output<Uint8Array>();

    // ---------------------------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------------------------

    /** The pages of the document. */
    readonly pages = signal<PdfPageInfo[]>([]);
    /** The fields of the form, with where each is. */
    readonly fields = signal<PdfFormField[]>([]);
    /** `true` while a document is being opened. */
    readonly loading = signal(false);
    /** Why the last document could not be opened. */
    readonly failure = signal('');
    /** The annotation that is selected. */
    readonly selectedId = signal<string | null>(null);
    /** `true` when there is something to undo. */
    readonly canUndo = signal(false);
    /** `true` when there is something to redo. */
    readonly canRedo = signal(false);

    protected readonly editingId = signal<string | null>(null);
    protected readonly draft = signal<PdfAnnotation | null>(null);
    protected readonly dropTarget = signal(-1);
    private readonly measurer = signal<TextMeasurer | null>(null);
    private readonly viewDoc = signal<PDFDocumentProxy | null>(null);

    protected readonly icons = ICONS;
    protected readonly tools = TOOLS;
    protected readonly widths = [1, 2, 3, 4, 6, 8];
    protected readonly sizes = [8, 10, 12, 14, 16, 18, 24, 32, 48];
    protected readonly textPadding = TEXT_PADDING;
    protected readonly lineHeight = LINE_HEIGHT;
    protected readonly handleSize = 7;

    /** The page that is shown. */
    readonly current = computed(() => this.pages()[this.pageIndex()] ?? null);
    protected readonly pixelWidth = computed(() => (this.current()?.width ?? 0) * this.scale());
    protected readonly pixelHeight = computed(() => (this.current()?.height ?? 0) * this.scale());
    /** The annotations of the page that is shown, with the one being drawn on top. */
    protected readonly drawn = computed(() => {
        const page = this.pageIndex();
        const list = this.annotations().filter((a) => a.page === page);
        const draft = this.draft();

        return draft && draft.page === page ? [...list, draft] : list;
    });
    protected readonly pageFields = computed(() => this.fields().filter((f) => f.page === this.pageIndex()));
    protected readonly editing = computed(() => {
        const id = this.editingId();
        const a = id ? this.annotations().find((x) => x.id === id) : null;

        return a?.type === 'text' ? a : null;
    });
    protected readonly selection = computed(() => {
        const id = this.selectedId();
        const a = id ? this.annotations().find((x) => x.id === id && x.page === this.pageIndex()) : null;

        if (!a) return null;

        const box = boundsOf(a);
        const r = box.x + box.width;
        const b = box.y + box.height;
        const mx = box.x + box.width / 2;
        const my = box.y + box.height / 2;

        if (a.type === 'line' || a.type === 'arrow') {
            return {
                box,
                handles: [
                    { name: 'p1', x: a.x1, y: a.y1, cursor: 'move' },
                    { name: 'p2', x: a.x2, y: a.y2, cursor: 'move' }
                ]
            };
        }

        if (!isBoxed(a)) return { box, handles: [] as { name: string; x: number; y: number; cursor: string }[] };

        const at: Record<string, [number, number, string]> = {
            nw: [box.x, box.y, 'nwse-resize'],
            n: [mx, box.y, 'ns-resize'],
            ne: [r, box.y, 'nesw-resize'],
            e: [r, my, 'ew-resize'],
            se: [r, b, 'nwse-resize'],
            s: [mx, b, 'ns-resize'],
            sw: [box.x, b, 'nesw-resize'],
            w: [box.x, my, 'ew-resize']
        };

        return { box, handles: HANDLES.map((name) => ({ name, x: at[name][0], y: at[name][1], cursor: at[name][2] })) };
    });

    private bytes: Uint8Array | null = null;
    private doc: PDFDocument | null = null;
    private gesture: Gesture | null = null;
    private render: PageRender | null = null;
    private thumbnails = 0;
    private undoStack: Snapshot[] = [];
    private redoStack: Snapshot[] = [];
    private sourceToken = 0;
    private pendingImagePoint: [number, number] = [20, 20];
    private dragFrom = -1;

    constructor() {
        super();

        afterNextRender(() => {
            void createTextMeasurer().then((m) => this.measurer.set(m));

            // A new source opens a new document.
            effect(
                () => {
                    const src = this.src();

                    untracked(() => void this.openSource(src));
                },
                { injector: this.injector }
            );
            // The page, the zoom or a new document redraws the page.
            effect(
                () => {
                    const doc = this.viewDoc();
                    const index = this.pageIndex();
                    const scale = this.scale();

                    this.pages();
                    untracked(() => this.drawPage(doc, index, scale));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const doc = this.viewDoc();

                    this.pages();
                    this.sidebarOpen();
                    untracked(() => void this.drawThumbnails(doc));
                },
                { injector: this.injector }
            );
            // The text box takes the focus when it appears.
            effect(
                () => {
                    const editor = this.editorRef();

                    if (editor) untracked(() => queueMicrotask(() => (editor.nativeElement.focus(), editor.nativeElement.select())));
                },
                { injector: this.injector }
            );
        });

        this.destroyRef.onDestroy(() => {
            this.render?.cancel();
            this.thumbnails++;
            void this.viewDoc()?.loadingTask.destroy();
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Opening
    // ---------------------------------------------------------------------------------------------

    private async openSource(src: PdfSource): Promise<void> {
        const token = ++this.sourceToken;

        if (src == null || src === '') {
            this.bytes = null;
            this.doc = null;
            this.pages.set([]);
            this.fields.set([]);
            this.viewDoc.set(null);

            return;
        }

        this.loading.set(true);
        this.failure.set('');

        try {
            const bytes = await this.readSource(src);

            if (token !== this.sourceToken) return;

            this.undoStack = [];
            this.redoStack = [];
            this.syncHistory();
            this.selectedId.set(null);
            this.pageIndex.set(0);
            await this.open(bytes);

            if (token !== this.sourceToken) return;

            if (this.fitOnLoad()) this.fitWidth();

            this.changed.emit({ type: 'load' });
        } catch (error) {
            if (token !== this.sourceToken) return;

            const message = error instanceof Error ? error.message : 'The document could not be opened';

            this.failure.set(message);
            this.pages.set([]);
            this.failed.emit({ message });
        } finally {
            if (token === this.sourceToken) this.loading.set(false);
        }
    }

    private async readSource(src: Exclude<PdfSource, null | undefined>): Promise<Uint8Array> {
        let bytes: Uint8Array;

        if (typeof src === 'string' || src instanceof URL) {
            const response = await fetch(src);

            if (!response.ok) throw new Error(`The document could not be loaded (${response.status})`);

            bytes = new Uint8Array(await response.arrayBuffer());
        } else if (src instanceof Blob) bytes = new Uint8Array(await src.arrayBuffer());
        else if (src instanceof Uint8Array) bytes = src.slice();
        else bytes = new Uint8Array(src.slice(0));

        if (!looksLikePdf(bytes)) throw new Error('This is not a PDF');

        return bytes;
    }

    /** Takes bytes as the document: parses them for editing and for drawing. */
    private async open(bytes: Uint8Array): Promise<void> {
        const doc = await loadPdf(bytes);
        const view = await openDocument(bytes, { workerSrc: this.workerSrc() || undefined, assetsUrl: this.assetsUrl() || undefined });
        const previous = this.viewDoc();

        this.bytes = bytes;
        this.doc = doc;

        const pages = pageInfos(doc);
        const fields = readForm(doc);

        this.fields.set(fields);
        this.pages.set(pages);
        this.viewDoc.set(view);
        void previous?.loadingTask.destroy();

        if (this.pageIndex() >= pages.length) this.pageIndex.set(Math.max(pages.length - 1, 0));

        this.loaded.emit({ pages: pages.length, fields: new Set(fields.map((f) => f.name)).size });
    }

    // ---------------------------------------------------------------------------------------------
    // Drawing the page
    // ---------------------------------------------------------------------------------------------

    private drawPage(doc: PDFDocumentProxy | null, index: number, scale: number): void {
        const canvas = this.canvasRef()?.nativeElement;

        this.render?.cancel();

        if (!doc || !canvas || !this.browser || index < 0 || index >= doc.numPages) return;

        this.render = renderPage(doc, index, canvas, scale, window.devicePixelRatio || 1);
        this.render.promise.catch((error) => this.failed.emit({ message: String(error?.message ?? error) }));
    }

    private async drawThumbnails(doc: PDFDocumentProxy | null): Promise<void> {
        const token = ++this.thumbnails;

        if (!doc || !this.browser || !this.sidebar()) return;

        // The thumbnails are in the DOM once the sidebar has rendered.
        await new Promise((resolve) => setTimeout(resolve, 0));

        const host = this.el.nativeElement as HTMLElement;

        for (const canvas of Array.from(host.querySelectorAll<HTMLCanvasElement>('canvas[data-thumbnail]'))) {
            if (token !== this.thumbnails) return;

            const index = Number(canvas.dataset['index']);
            const info = this.pages()[index];

            if (!info) continue;

            try {
                await renderPage(doc, index, canvas, Math.min(112 / info.width, 0.4), 1).promise;
            } catch {
                // A thumbnail that fails is left empty.
            }
        }
    }

    // ---------------------------------------------------------------------------------------------
    // History
    // ---------------------------------------------------------------------------------------------

    private snapshot(): Snapshot | null {
        return this.bytes ? { annotations: this.annotations(), bytes: this.bytes, page: this.pageIndex() } : null;
    }

    private remember(): void {
        const snap = this.snapshot();

        if (!snap) return;

        this.undoStack.push(snap);

        if (this.undoStack.length > HISTORY_LIMIT) this.undoStack.shift();

        this.redoStack = [];
        this.syncHistory();
    }

    private syncHistory(): void {
        this.canUndo.set(this.undoStack.length > 0);
        this.canRedo.set(this.redoStack.length > 0);
    }

    private async restore(snap: Snapshot, type: 'undo' | 'redo'): Promise<void> {
        this.selectedId.set(null);
        this.editingId.set(null);

        if (snap.bytes !== this.bytes) await this.open(snap.bytes);

        this.annotations.set(snap.annotations);
        this.pageIndex.set(Math.min(snap.page, this.pages().length - 1));
        this.syncHistory();
        this.changed.emit({ type });
    }

    /** Goes back one change: an annotation, or a page operation. */
    async undo(): Promise<void> {
        const snap = this.undoStack.pop();
        const now = this.snapshot();

        if (!snap || !now) return;

        this.redoStack.push(now);
        await this.restore(snap, 'undo');
    }

    /** Goes forward again after an undo. */
    async redo(): Promise<void> {
        const snap = this.redoStack.pop();
        const now = this.snapshot();

        if (!snap || !now) return;

        this.undoStack.push(now);
        await this.restore(snap, 'redo');
    }

    // ---------------------------------------------------------------------------------------------
    // Annotations
    // ---------------------------------------------------------------------------------------------

    /** Adds an annotation. Without an `id` one is made up. Returns the annotation as it was added. */
    addAnnotation<T extends PdfAnnotation = PdfAnnotation>(annotation: PdfAnnotationInput<T>): T {
        const added = { ...annotation, id: annotation.id ?? nextAnnotationId() } as unknown as T;

        this.remember();
        this.annotations.set([...this.annotations(), added]);
        this.changed.emit({ type: 'annotation' });

        return added;
    }

    /** Changes the annotation with an id. */
    updateAnnotation(id: string, change: Partial<PdfAnnotation>): void {
        this.remember();
        this.annotations.set(this.annotations().map((a) => (a.id === id ? ({ ...a, ...change } as PdfAnnotation) : a)));
        this.changed.emit({ type: 'annotation' });
    }

    /** Removes the annotation with an id. */
    removeAnnotation(id: string): void {
        this.remember();
        this.annotations.set(this.annotations().filter((a) => a.id !== id));

        if (this.selectedId() === id) this.selectedId.set(null);

        this.changed.emit({ type: 'annotation' });
    }

    /** Removes the selected annotation. */
    removeSelected(): void {
        const id = this.selectedId();

        if (id) this.removeAnnotation(id);
    }

    /** Removes every annotation, or those of one page. */
    clearAnnotations(page?: number): void {
        this.remember();
        this.annotations.set(page == null ? [] : this.annotations().filter((a) => a.page !== page));
        this.selectedId.set(null);
        this.changed.emit({ type: 'annotation' });
    }

    /** Selects an annotation, on the page it is on. */
    select(id: string | null): void {
        const a = id ? this.annotations().find((x) => x.id === id) : null;

        this.selectedId.set(a ? a.id : null);

        if (a) this.goTo(a.page);
    }

    /** Copies the selected annotation, a little to the side. */
    duplicateSelected(): void {
        const a = this.annotations().find((x) => x.id === this.selectedId());

        if (!a) return;

        const copy = this.addAnnotation(moveAnnotation({ ...a, id: nextAnnotationId() }, 10, 10));

        this.selectedId.set(copy.id);
    }

    /** Sets the tool, and drops what was being done with the last one. */
    setTool(tool: PdfTool): void {
        this.tool.set(tool);
        this.draft.set(null);

        if (tool === 'image') {
            this.pendingImagePoint = [40, 40];
            this.imageInput().nativeElement.click();
        }
    }

    /** Sets the colour, and the selected annotation takes it. */
    setColor(color: string): void {
        this.color.set(color);

        const a = this.annotations().find((x) => x.id === this.selectedId());

        if (a && 'color' in a) this.updateAnnotation(a.id, { color } as Partial<PdfAnnotation>);
    }

    /** Sets the font size, and the selected text takes it. */
    setFontSize(size: number): void {
        this.fontSize.set(size);

        const a = this.annotations().find((x) => x.id === this.selectedId());

        if (a?.type === 'text') this.updateAnnotation(a.id, { fontSize: size, height: this.textHeight(a.text, a.width, size, a.fontFamily) } as Partial<PdfAnnotation>);
    }

    /** Sets the font, and the selected text takes it. */
    setFontFamily(family: PdfFontFamily): void {
        this.fontFamily.set(family);

        const a = this.annotations().find((x) => x.id === this.selectedId());

        if (a?.type === 'text') this.updateAnnotation(a.id, { fontFamily: family, height: this.textHeight(a.text, a.width, a.fontSize, family) } as Partial<PdfAnnotation>);
    }

    // ---------------------------------------------------------------------------------------------
    // Text
    // ---------------------------------------------------------------------------------------------

    protected cssFont(family: PdfFontFamily): string {
        return CSS_FONTS[family] ?? CSS_FONTS.helvetica;
    }

    protected ascent(a: { fontFamily: PdfFontFamily; fontSize: number }): number {
        return ASCENT[a.fontFamily] * a.fontSize;
    }

    private measure(text: string, size: number, family: PdfFontFamily): number {
        const m = this.measurer();

        return m ? m(text, size, family) : text.length * size * 0.5;
    }

    protected textLines(a: { text: string; width: number; fontSize: number; fontFamily: PdfFontFamily }): string[] {
        return wrapText(a.text, Math.max(a.width - TEXT_PADDING * 2, 1), (t) => this.measure(t, a.fontSize, a.fontFamily));
    }

    private textHeight(text: string, width: number, size: number, family: PdfFontFamily): number {
        const lines = this.textLines({ text, width, fontSize: size, fontFamily: family }).length;

        return Math.max(lines, 1) * size * LINE_HEIGHT + TEXT_PADDING * 2;
    }

    /** Ends the editing of a text, with what was typed. A text with nothing in it is removed. */
    protected commitText(text: string): void {
        const id = this.editingId();

        if (!id) return;

        this.editingId.set(null);

        const a = this.annotations().find((x) => x.id === id);

        if (a?.type !== 'text') return;

        if (!text.trim()) {
            // A text that was just made and left empty was never there: it is not a step to undo.
            this.annotations.set(this.annotations().filter((x) => x.id !== id));
            this.selectedId.set(null);
            this.changed.emit({ type: 'annotation' });

            return;
        }

        if (text === a.text) return;

        this.annotations.set(this.annotations().map((x) => (x.id === id ? { ...a, text, height: this.textHeight(text, a.width, a.fontSize, a.fontFamily) } : x)));
        this.changed.emit({ type: 'annotation' });
    }

    protected onEditorKeydown(event: KeyboardEvent): void {
        event.stopPropagation();

        if (event.key === 'Escape') {
            event.preventDefault();
            this.commitText((event.target as HTMLTextAreaElement).value);
        }
    }

    // ---------------------------------------------------------------------------------------------
    // Pointer
    // ---------------------------------------------------------------------------------------------

    private toPage(event: PointerEvent | MouseEvent): [number, number] {
        const svg = this.overlayRef()?.nativeElement;

        if (!svg) return [0, 0];

        const rect = svg.getBoundingClientRect();
        const scale = this.scale();

        return [(event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale];
    }

    private capture(el: Element | undefined, id: number): void {
        try {
            el?.setPointerCapture?.(id);
        } catch {
            // A pointer that is not active, such as one made by a script, cannot be captured; the drag works without.
        }
    }

    private release(el: Element, id: number): void {
        try {
            el.releasePointerCapture?.(id);
        } catch {
            // As above.
        }
    }

    private clampToPage(x: number, y: number): [number, number] {
        const page = this.current();

        return page ? [Math.min(Math.max(x, 0), page.width), Math.min(Math.max(y, 0), page.height)] : [x, y];
    }

    protected onPointerDown(event: PointerEvent): void {
        if (this.readonly() || event.button !== 0) return;

        const [x, y] = this.toPage(event);
        const page = this.pageIndex();
        const tool = this.tool();

        if (this.editingId()) return;

        this.capture(event.currentTarget as Element, event.pointerId);
        this.stageRef()?.nativeElement.focus({ preventScroll: true });

        if (tool === 'select') {
            const hit = pickAnnotation(this.annotations(), page, x, y);

            this.selectedId.set(hit?.id ?? null);

            if (hit) this.gesture = { kind: 'move', id: hit.id, start: [x, y], original: hit, moved: false };

            return;
        }

        this.selectedId.set(null);

        switch (tool) {
            case 'text': {
                const size = this.fontSize();
                const family = this.fontFamily();
                const width = Math.min(200, (this.current()?.width ?? 200) - x);
                const a = this.addAnnotation<PdfAnnotation>({ page, type: 'text', x, y, width: Math.max(width, 40), height: size * LINE_HEIGHT + TEXT_PADDING * 2, text: '', fontSize: size, fontFamily: family, color: this.color() });

                this.selectedId.set(a.id);
                this.editingId.set(a.id);
                this.tool.set('select');
                break;
            }
            case 'image': {
                this.pendingImagePoint = [x, y];
                this.imageInput().nativeElement.click();
                break;
            }
            case 'signature': {
                const url = this.signature();

                if (!url) return void this.signatureRequested.emit();

                void this.placePicture(url, x, y, 'signature');
                break;
            }
            case 'draw':
                this.draft.set({ id: 'draft', page, type: 'draw', points: [[x, y]], color: this.color(), strokeWidth: this.strokeWidth() });
                this.gesture = { kind: 'ink' };
                break;
            default:
                this.draft.set(this.newShape(tool, page, x, y));
                this.gesture = { kind: 'create', start: [x, y] };
        }
    }

    private newShape(tool: PdfTool, page: number, x: number, y: number): PdfAnnotation | null {
        switch (tool) {
            case 'highlight':
                return { id: 'draft', page, type: 'highlight', x, y, width: 0, height: 0, color: this.highlightColor(), opacity: this.highlightOpacity() };
            case 'rectangle':
            case 'ellipse':
                return { id: 'draft', page, type: tool, x, y, width: 0, height: 0, color: this.color(), strokeWidth: this.strokeWidth(), fillColor: this.fillColor(), fillOpacity: 0.35 };
            case 'line':
            case 'arrow':
                return { id: 'draft', page, type: tool, x1: x, y1: y, x2: x, y2: y, color: this.color(), strokeWidth: this.strokeWidth() };
            default:
                return null;
        }
    }

    protected onPointerMove(event: PointerEvent): void {
        const g = this.gesture;

        if (!g) return;

        const [x, y] = this.clampToPage(...this.toPage(event));

        switch (g.kind) {
            case 'ink': {
                const d = this.draft();

                if (d?.type !== 'draw') return;

                const last = d.points[d.points.length - 1];

                // Points closer than a point to the last one add nothing a reader can see.
                if (Math.hypot(x - last[0], y - last[1]) >= 1) this.draft.set({ ...d, points: [...d.points, [x, y]] });

                break;
            }
            case 'create': {
                const d = this.draft();

                if (!d) return;

                if (d.type === 'line' || d.type === 'arrow') {
                    let [ex, ey] = [x, y];

                    // Shift holds the line to a multiple of 45 degrees.
                    if (event.shiftKey) {
                        const angle = Math.round(Math.atan2(y - d.y1, x - d.x1) / (Math.PI / 4)) * (Math.PI / 4);
                        const length = Math.hypot(x - d.x1, y - d.y1);

                        [ex, ey] = [d.x1 + length * Math.cos(angle), d.y1 + length * Math.sin(angle)];
                    }

                    this.draft.set({ ...d, x2: ex, y2: ey });
                } else if (isBoxed(d)) {
                    let w = x - g.start[0];
                    let h = y - g.start[1];

                    // Shift holds a rectangle to a square and an ellipse to a circle.
                    if (event.shiftKey && d.type !== 'highlight') {
                        const side = Math.max(Math.abs(w), Math.abs(h));

                        w = Math.sign(w || 1) * side;
                        h = Math.sign(h || 1) * side;
                    }

                    this.draft.set({ ...d, x: Math.min(g.start[0], g.start[0] + w), y: Math.min(g.start[1], g.start[1] + h), width: Math.abs(w), height: Math.abs(h) });
                }

                break;
            }
            case 'move': {
                const dx = x - g.start[0];
                const dy = y - g.start[1];

                if (!g.moved && Math.hypot(dx, dy) < 2) return;

                if (!g.moved) {
                    this.remember();
                    g.moved = true;
                }

                this.annotations.set(this.annotations().map((a) => (a.id === g.id ? moveAnnotation(g.original, dx, dy) : a)));
                break;
            }
            case 'resize': {
                const o = g.original;

                if (!isBoxed(o)) return;

                if (!g.moved) {
                    this.remember();
                    g.moved = true;
                }

                const next = this.resizedBox(o, g.handle, x, y);

                this.annotations.set(this.annotations().map((a) => (a.id === g.id ? resizeAnnotation(a, next, o.type === 'image' || o.type === 'signature' || event.shiftKey) : a)));
                break;
            }
            case 'endpoint': {
                const o = g.original;

                if (o.type !== 'line' && o.type !== 'arrow') return;

                if (!g.moved) {
                    this.remember();
                    g.moved = true;
                }

                this.annotations.set(this.annotations().map((a) => (a.id === g.id ? (g.end === 1 ? { ...o, x1: x, y1: y } : { ...o, x2: x, y2: y }) : a)));
                break;
            }
        }
    }

    private resizedBox(o: Box, handle: string, x: number, y: number): Box {
        let left = o.x;
        let top = o.y;
        let right = o.x + o.width;
        let bottom = o.y + o.height;

        if (handle.includes('w')) left = Math.min(x, right - 4);
        if (handle.includes('e')) right = Math.max(x, left + 4);
        if (handle.includes('n')) top = Math.min(y, bottom - 4);
        if (handle.includes('s')) bottom = Math.max(y, top + 4);

        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    protected onPointerUp(event: PointerEvent): void {
        const g = this.gesture;

        this.gesture = null;
        this.release(event.currentTarget as Element, event.pointerId);

        if (!g) return;

        if (g.kind === 'move' || g.kind === 'resize' || g.kind === 'endpoint') {
            if (g.moved) this.changed.emit({ type: 'annotation' });

            return;
        }

        const d = this.draft();

        this.draft.set(null);

        if (!d) return;

        // A click that did not drag makes nothing, except a dot with the pen.
        const size = d.type === 'line' || d.type === 'arrow' ? Math.hypot(d.x2 - d.x1, d.y2 - d.y1) : isBoxed(d) ? Math.max(d.width, d.height) : d.type === 'draw' ? d.points.length : 99;

        if (d.type !== 'draw' && size < 3) return;

        const { id: _draft, ...rest } = d;
        const added = this.addAnnotation<PdfAnnotation>(rest as any);

        this.selectedId.set(added.id);
        this.tool.update((t) => (t === 'highlight' || t === 'draw' ? t : 'select'));
    }

    protected onHandleDown(event: PointerEvent, handle: string): void {
        event.stopPropagation();

        const id = this.selectedId();
        const a = this.annotations().find((x) => x.id === id);

        if (!a || this.readonly()) return;

        // The pointer is captured on the whole overlay, so that moving off the handle does not lose the drag.
        this.capture(this.overlayRef()?.nativeElement, event.pointerId);
        this.gesture = handle === 'p1' || handle === 'p2' ? { kind: 'endpoint', id: a.id, end: handle === 'p1' ? 1 : 2, original: a, moved: false } : { kind: 'resize', id: a.id, handle, original: a, moved: false };
    }

    protected onDoubleClick(event: MouseEvent): void {
        if (this.readonly()) return;

        const [x, y] = this.toPage(event);
        const hit = pickAnnotation(this.annotations(), this.pageIndex(), x, y);

        if (hit?.type === 'text') {
            this.remember();
            this.selectedId.set(hit.id);
            this.editingId.set(hit.id);
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (this.editingId() || this.readonly()) return;

        const target = event.target as HTMLElement;

        // Typing in a field or a toolbar control is not for the editor.
        if (target.closest('input, select, textarea') && !(target as HTMLInputElement).type?.match(/^(button)$/)) return;

        const mod = event.ctrlKey || event.metaKey;
        const id = this.selectedId();

        if (mod && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            void (event.shiftKey ? this.redo() : this.undo());
        } else if (mod && event.key.toLowerCase() === 'y') {
            event.preventDefault();
            void this.redo();
        } else if (mod && event.key.toLowerCase() === 'd' && id) {
            event.preventDefault();
            this.duplicateSelected();
        } else if ((event.key === 'Delete' || event.key === 'Backspace') && id) {
            event.preventDefault();
            this.removeSelected();
        } else if (event.key === 'Escape') {
            this.selectedId.set(null);
            this.draft.set(null);
            this.gesture = null;
            this.tool.set('select');
        } else if (id && event.key.startsWith('Arrow')) {
            event.preventDefault();

            const step = event.shiftKey ? 10 : 1;
            const [dx, dy] = event.key === 'ArrowLeft' ? [-step, 0] : event.key === 'ArrowRight' ? [step, 0] : event.key === 'ArrowUp' ? [0, -step] : [0, step];

            this.remember();
            this.annotations.set(this.annotations().map((a) => (a.id === id ? moveAnnotation(a, dx, dy) : a)));
            this.changed.emit({ type: 'annotation' });
        } else if (event.key === 'PageDown') this.goTo(this.pageIndex() + 1);
        else if (event.key === 'PageUp') this.goTo(this.pageIndex() - 1);
    }

    // ---------------------------------------------------------------------------------------------
    // Pictures
    // ---------------------------------------------------------------------------------------------

    protected onImagePicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => void this.placePicture(String(reader.result), this.pendingImagePoint[0], this.pendingImagePoint[1], 'image');
        reader.readAsDataURL(file);
    }

    /** Puts a picture on the page that is shown, with its top left at a point, scaled to fit a reasonable size. */
    async placePicture(dataUrl: string, x = 40, y = 40, type: 'image' | 'signature' = 'image'): Promise<PdfImageAnnotation> {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();

            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error('The picture could not be read'));
            el.src = dataUrl;
        });
        const page = this.current();
        const maxWidth = Math.min(type === 'signature' ? 160 : 240, (page?.width ?? 240) - 8);
        const ratio = image.naturalHeight / Math.max(image.naturalWidth, 1);
        const width = Math.min(image.naturalWidth, maxWidth);
        const height = width * ratio;
        // A signature is centred on the click; a picture hangs from it.
        const px = Math.min(Math.max(type === 'signature' ? x - width / 2 : x, 0), Math.max((page?.width ?? width) - width, 0));
        const py = Math.min(Math.max(type === 'signature' ? y - height / 2 : y, 0), Math.max((page?.height ?? height) - height, 0));
        const added = this.addAnnotation<PdfImageAnnotation>({ page: this.pageIndex(), type, x: px, y: py, width, height, dataUrl });

        this.selectedId.set(added.id);
        this.tool.set('select');

        return added;
    }

    // ---------------------------------------------------------------------------------------------
    // Pages
    // ---------------------------------------------------------------------------------------------

    /** Shows a page. */
    goTo(index: number): void {
        const i = Math.min(Math.max(index, 0), Math.max(this.pages().length - 1, 0));

        if (i !== this.pageIndex()) {
            this.selectedId.set(null);
            this.pageIndex.set(i);
        }
    }

    /** Zooms in a step. */
    zoomIn(): void {
        this.scale.set(Math.min(+(this.scale() * 1.25).toFixed(3), 5));
    }

    /** Zooms out a step. */
    zoomOut(): void {
        this.scale.set(Math.max(+(this.scale() / 1.25).toFixed(3), 0.25));
    }

    /** Zooms so that the page is as wide as the editor. */
    fitWidth(): void {
        const stage = this.stageRef()?.nativeElement;
        const page = this.current();

        if (stage && page) this.scale.set(Math.min(Math.max(+((stage.clientWidth - 32) / page.width).toFixed(3), 0.25), 5));
    }

    /** A change to the pages: the document is saved to bytes and opened again, and the annotations are moved to follow. */
    private async changePages(edit: (doc: PDFDocument) => void | Promise<void>, annotations?: PdfAnnotation[], page?: number): Promise<void> {
        if (!this.doc) return;

        this.remember();

        const before = this.annotations();

        try {
            await edit(this.doc);

            const bytes = await this.doc.save();

            await this.open(bytes);

            if (annotations) this.annotations.set(annotations);

            if (page != null) this.pageIndex.set(Math.min(Math.max(page, 0), this.pages().length - 1));

            this.selectedId.set(null);
            this.changed.emit({ type: 'page' });
        } catch (error) {
            // A failed change leaves the document as it was.
            this.undoStack.pop();
            this.syncHistory();
            this.annotations.set(before);

            if (this.bytes) await this.open(this.bytes);

            this.failed.emit({ message: error instanceof Error ? error.message : 'The change could not be made' });
        }
    }

    /** Turns a page by a multiple of 90 degrees, clockwise when positive. Defaults to the page that is shown. */
    rotateCurrentPage(by = 90, index = this.pageIndex()): Promise<void> {
        return this.changePages((doc) => rotatePage(doc, index, by));
    }

    /** Removes a page, and what is drawn on it. Defaults to the page that is shown. */
    async deleteCurrentPage(index = this.pageIndex()): Promise<void> {
        if (this.pages().length < 2) return;

        const { afterDeletePage } = await import('./pdf-model');

        await this.changePages((doc) => deletePage(doc, index), afterDeletePage(this.annotations(), index), Math.min(index, this.pages().length - 2));
    }

    /** Moves a page from a position to another. What is drawn on it goes with it. */
    async movePage(from: number, to: number): Promise<void> {
        if (from === to || from < 0 || to < 0 || from >= this.pages().length || to >= this.pages().length) return;

        const { afterMovePage } = await import('./pdf-model');

        await this.changePages((doc) => movePage(doc, from, to), afterMovePage(this.annotations(), from, to), to);
    }

    /** Adds an empty page after the one that is shown, or at a position. */
    async addBlankPage(at = this.pageIndex() + 1): Promise<void> {
        const { afterInsertPage } = await import('./pdf-model');

        await this.changePages((doc) => insertBlankPage(doc, at), afterInsertPage(this.annotations(), at), at);
    }

    /** Merges another PDF in, at a position, after the shown page by default. Returns how many pages came in. */
    async merge(source: Blob | ArrayBuffer | Uint8Array, at = this.pageIndex() + 1): Promise<number> {
        const bytes = source instanceof Blob ? new Uint8Array(await source.arrayBuffer()) : source instanceof Uint8Array ? source : new Uint8Array(source);
        let added = 0;
        const { afterInsertPage } = await import('./pdf-model');
        const count = (await (await loadPdf(bytes)).getPageCount()) as number;

        await this.changePages(async (doc) => void (added = await mergePdf(doc, bytes, at)), afterInsertPage(this.annotations(), at, count), at);

        return added;
    }

    protected onMergePicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (file) void this.merge(file);
    }

    /** A new file made of some of the pages, with the annotations and the form of those pages. */
    async extract(pages: number[]): Promise<Uint8Array> {
        const done = await this.save();

        return extractPages(await loadPdf(done), pages);
    }

    // ---------------------------------------------------------------------------------------------
    // Thumbnails drag and drop
    // ---------------------------------------------------------------------------------------------

    protected onDragStart(event: DragEvent, index: number): void {
        this.dragFrom = index;
        event.dataTransfer?.setData('text/plain', String(index));

        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    }

    protected onDragOver(event: DragEvent, index: number): void {
        if (this.dragFrom < 0) return;

        event.preventDefault();
        this.dropTarget.set(index);
    }

    protected onDrop(event: DragEvent, index: number): void {
        event.preventDefault();
        this.dropTarget.set(-1);

        const from = this.dragFrom;

        this.dragFrom = -1;

        if (from >= 0) void this.movePage(from, index);
    }

    // ---------------------------------------------------------------------------------------------
    // Form
    // ---------------------------------------------------------------------------------------------

    protected fieldStyle(f: PdfFormField): Record<string, string> {
        const s = this.scale();

        return { left: `${f.x * s}px`, top: `${f.y * s}px`, width: `${f.width * s}px`, height: `${f.height * s}px`, 'font-size': `${Math.max(Math.min(f.height * s * 0.7, 16 * s), 8)}px` };
    }

    protected formValue(f: PdfFormField): PdfFormValues[string] {
        const values = this.formValues();

        return f.name in values ? values[f.name] : f.value;
    }

    protected textValue(f: PdfFormField): string {
        const v = this.formValue(f);

        return typeof v === 'string' ? v : '';
    }

    protected listValue(f: PdfFormField): string[] {
        const v = this.formValue(f);

        return Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : [];
    }

    protected selectedOptions(select: HTMLSelectElement): string[] {
        return Array.from(select.selectedOptions).map((o) => o.value);
    }

    /** Sets the value of a field of the form. */
    setFormValue(name: string, value: PdfFormValues[string]): void {
        this.formValues.set({ ...this.formValues(), [name]: value });
        this.changed.emit({ type: 'form' });
    }

    // ---------------------------------------------------------------------------------------------
    // Saving
    // ---------------------------------------------------------------------------------------------

    protected arrowPath(a: { x1: number; y1: number; x2: number; y2: number; strokeWidth: number }): string {
        const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
        const head = Math.max(a.strokeWidth * 4, 10);
        const wing = (side: number) => `M${a.x2} ${a.y2}L${a.x2 - head * Math.cos(angle + (side * Math.PI) / 7)} ${a.y2 - head * Math.sin(angle + (side * Math.PI) / 7)}`;

        return `M${a.x1} ${a.y1}L${a.x2} ${a.y2}${wing(-1)}${wing(1)}`;
    }

    protected inkPath(points: [number, number][]): string {
        return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
    }

    /** Makes the new file: the pages, the form filled in and the annotations written into the pages. */
    async save(): Promise<Uint8Array> {
        if (!this.bytes) throw new Error('There is no document');

        // Only the values that were set are written: a field the user did not touch keeps what the file has.
        const out = await exportPdf(this.bytes, { annotations: this.annotations(), formValues: this.formValues(), flatten: this.flatten() });

        this.saved.emit(out);

        return out;
    }

    /** The new file as a `Blob`. */
    async saveAsBlob(): Promise<Blob> {
        return new Blob([(await this.save()) as BlobPart], { type: 'application/pdf' });
    }

    /** Makes the new file and has the browser download it. */
    async download(fileName = this.fileName()): Promise<void> {
        const blob = await this.saveAsBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /** The bytes of the document as they are now, without the annotations: after the page changes, before the drawing. */
    getBytes(): Uint8Array | null {
        return this.bytes ? this.bytes.slice() : null;
    }

    /** Moves the focus onto the editor. */
    focus(): void {
        (this.el.nativeElement as HTMLElement).focus();
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [PdfEditor, SharedModule],
    exports: [PdfEditor, SharedModule]
})
export class PdfEditorModule {}
