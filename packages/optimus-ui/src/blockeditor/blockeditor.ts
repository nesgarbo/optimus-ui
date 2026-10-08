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
    forwardRef,
    inject,
    input,
    model,
    NgModule,
    output,
    PLATFORM_ID,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '@openng/optimus-ui/api';
import { PARENT_INSTANCE } from '@openng/optimus-ui/basecomponent';
import { BaseEditableHolder } from '@openng/optimus-ui/baseeditableholder';
import { Bind } from '@openng/optimus-ui/bind';
import type { BlockChangeEvent, BlockCommand, BlockContent, BlockEditorPassThrough, BlockFormat, BlockImageRequest } from '@openng/optimus-ui/types/blockeditor';
import type { Editor, Range } from '@tiptap/core';
import { DEFAULT_BLOCK_COMMANDS, filterCommands, normalizeUrl, stepIndex } from './block-commands';
import { BlockEditorStyle } from './style/blockeditorstyle';

export const BLOCKEDITOR_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BlockEditor),
    multi: true
};

/** What the slash menu is doing. */
interface SlashState {
    items: BlockCommand[];
    index: number;
    x: number;
    y: number;
    range: Range;
}

/** Where the toolbar over a selection is, and what it is for. */
interface BubbleState {
    x: number;
    y: number;
}

/** A value the editor can hold. */
export type BlockValue = BlockContent | string | null;

const EMPTY_DOC: BlockContent = { type: 'doc', content: [{ type: 'paragraph' }] };

/**
 * BlockEditor is a block-based editor, on top of Tiptap.
 *
 * Every paragraph, heading, list, to-do, quote, code block or picture is a block. Typing `/` at the start of a line opens a menu
 * to turn it into another kind; selecting text opens a toolbar for bold, italic, strike, code and links; Alt + the arrow keys
 * move the block. The value is the document as a tree (`format="json"`, the default) or as HTML, and binds to a signal form with
 * `[formField]`, to a classic form, or two-way with `[(value)]`.
 *
 * Tiptap is an optional peer dependency, loaded when the first editor is shown.
 *
 * @group Components
 */
@Component({
    selector: 'p-blockeditor',
    standalone: true,
    imports: [SharedModule],
    template: `
        <div #content [class]="cx('content')" [attr.aria-label]="ariaLabel() || 'Editor'" role="textbox" aria-multiline="true"></div>
        @if (bubble(); as b) {
            <div [class]="cx('bubble')" role="toolbar" aria-label="Format" [style.left.px]="b.x" [style.top.px]="b.y" (mousedown)="$event.preventDefault()">
                @if (linking()) {
                    <input #linkInput type="url" placeholder="Paste a link" aria-label="Link address" [value]="linkValue()" (input)="linkValue.set($any($event.target).value)" (keydown)="onLinkKey($event)" />
                    <button type="button" [class]="cx('bubbleButton', { active: false })" (click)="applyLink()">Apply</button>
                    @if (activeMarks().link) {
                        <button type="button" [class]="cx('bubbleButton', { active: false })" (click)="removeLink()">Remove</button>
                    }
                } @else {
                    <button type="button" [class]="cx('bubbleButton', { active: activeMarks().bold })" aria-label="Bold" [attr.aria-pressed]="activeMarks().bold" (click)="toggle('bold')"><b>B</b></button>
                    <button type="button" [class]="cx('bubbleButton', { active: activeMarks().italic })" aria-label="Italic" [attr.aria-pressed]="activeMarks().italic" (click)="toggle('italic')"><i>I</i></button>
                    <button type="button" [class]="cx('bubbleButton', { active: activeMarks().strike })" aria-label="Strikethrough" [attr.aria-pressed]="activeMarks().strike" (click)="toggle('strike')"><s>S</s></button>
                    <button type="button" [class]="cx('bubbleButton', { active: activeMarks().code })" aria-label="Code" [attr.aria-pressed]="activeMarks().code" (click)="toggle('code')">&lt;/&gt;</button>
                    <button type="button" [class]="cx('bubbleButton', { active: activeMarks().link })" aria-label="Link" [attr.aria-pressed]="activeMarks().link" (click)="startLink()">🔗</button>
                }
            </div>
        }
        @if (slash(); as s) {
            <div [class]="cx('slash')" role="listbox" aria-label="Blocks" [style.left.px]="s.x" [style.top.px]="s.y" (mousedown)="$event.preventDefault()">
                @for (item of s.items; track item.id; let i = $index) {
                    <button type="button" role="option" [class]="cx('slashItem', { active: i === s.index })" [attr.aria-selected]="i === s.index" (mouseenter)="hoverSlash(i)" (click)="runSlash(item, s.range)">
                        <span class="p-blockeditor-slash-icon" aria-hidden="true">{{ item.icon }}</span>
                        <span class="p-blockeditor-slash-text">
                            {{ item.label }}
                            @if (item.description) {
                                <small>{{ item.description }}</small>
                            }
                        </span>
                    </button>
                } @empty {
                    <div class="p-blockeditor-slash-empty">No blocks match</div>
                }
            </div>
        }
        <input #imageInput type="file" accept="image/*" hidden (change)="onImagePicked($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BlockEditorStyle, BLOCKEDITOR_VALUE_ACCESSOR, { provide: PARENT_INSTANCE, useExisting: BlockEditor }],
    host: { '[class]': 'cx("root")', 'data-scope': 'blockeditor', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class BlockEditor extends BaseEditableHolder<BlockEditorPassThrough> {
    componentName = 'BlockEditor';

    /** @internal */
    _componentStyle = inject(BlockEditorStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');
    private readonly imageInput = viewChild.required<ElementRef<HTMLInputElement>>('imageInput');
    private readonly linkInput = viewChild<ElementRef<HTMLInputElement>>('linkInput');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The document: a tree of nodes, or HTML, as `format` says. Supports `[(value)]`, `[formField]`, `formControl` and `ngModel`.
     * @group Props
     */
    readonly value = model<BlockValue>(null);
    /**
     * How `value` is held: `json` is a tree of nodes, `html` is a string.
     * @group Props
     */
    readonly format = input<BlockFormat>('json');
    /**
     * Text shown in an empty block.
     * @group Props
     */
    readonly placeholder = input("Type '/' for blocks");
    /**
     * The entries of the slash menu. Defaults to text, three headings, three lists, a quote, code, a divider and an image.
     * @group Props
     */
    readonly commands = input<BlockCommand[]>(DEFAULT_BLOCK_COMMANDS);
    /**
     * Lets the document be read and not changed.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Shows the toolbar that opens over a selection.
     * @group Props
     */
    readonly bubbleMenu = input(true, { transform: booleanAttribute });
    /**
     * Sends a chosen picture somewhere and returns its URL. Without it the picture is embedded in the document as a data URL.
     * @group Props
     */
    readonly uploadImage = input<((file: File) => Promise<string>) | undefined>(undefined);
    /**
     * Focuses the editor when it is ready.
     * @group Props
     */
    readonly autofocus = input(false, { transform: booleanAttribute });
    /**
     * Name for assistive technology.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Emitted when the editor is ready.
     * @group Emits
     */
    readonly ready = output<Editor>();
    /**
     * Emitted when the document changes.
     * @group Emits
     */
    readonly changed = output<BlockChangeEvent>();
    /**
     * Emitted when a picture is chosen, before it is added. Set `url` to put another address on it.
     * @group Emits
     */
    readonly imageRequested = output<BlockImageRequest>();
    /**
     * Emitted when the control loses focus, for signal forms.
     * @group Emits
     */
    readonly touch = output<void>();
    /**
     * Emitted when the editor could not start.
     * @group Emits
     */
    readonly failed = output<string>();

    /** `true` when nothing can be changed. @internal */
    readonly locked = computed(() => this.readonly() || this.$disabled());
    /** `true` while the editor has the focus. @internal */
    readonly focused = signal(false);
    /** `true` when the document has nothing in it. */
    readonly isEmpty = signal(true);

    protected readonly bubble = signal<BubbleState | null>(null);
    protected readonly slash = signal<SlashState | null>(null);
    protected readonly linking = signal(false);
    protected readonly linkValue = signal('');
    protected readonly activeMarks = signal({ bold: false, italic: false, strike: false, code: false, link: false });

    private editor: Editor | null = null;
    /** What was last put into `value` by the editor, so that it is not put back into the editor. */
    private lastEmitted: BlockValue | undefined = undefined;
    private slashCommand: ((item: BlockCommand) => void) | null = null;

    constructor() {
        super();

        afterNextRender(() => {
            void this.start();

            // A value from outside -- a form, a binding -- replaces the document.
            effect(
                () => {
                    const next = this.value();

                    untracked(() => this.setFromOutside(next));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const locked = this.locked();

                    untracked(() => this.editor?.setEditable(!locked));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    // The link box takes the focus when it opens.
                    const input = this.linkInput();

                    if (input) untracked(() => queueMicrotask(() => input.nativeElement.focus()));
                },
                { injector: this.injector }
            );
        });

        this.destroyRef.onDestroy(() => {
            this.editor?.destroy();
            this.editor = null;
        });
    }

    /** What a classic form writes in: the value, which the document then follows. */
    override writeControlValue(value: BlockValue): void {
        this.value.set(value ?? null);
        this.cd.markForCheck();
    }

    // ---------------------------------------------------------------------------------------------
    // Tiptap
    // ---------------------------------------------------------------------------------------------

    private async start(): Promise<void> {
        if (!this.browser) return;

        try {
            const [core, starter, list, image, extensions, suggestion] = await Promise.all([
                import('@tiptap/core'),
                import('@tiptap/starter-kit'),
                import('@tiptap/extension-list'),
                import('@tiptap/extension-image'),
                import('@tiptap/extensions'),
                import('@tiptap/suggestion')
            ]);

            if (!this.contentRef()) return;

            const self = this;
            const Slash = core.Extension.create({
                name: 'blockSlash',
                // Before the keymaps of the blocks, so that Enter and the arrows go to the menu while it is open.
                priority: 1000,
                addProseMirrorPlugins() {
                    return [
                        suggestion.default<BlockCommand, BlockCommand>({
                            editor: this.editor,
                            char: '/',
                            startOfLine: false,
                            allowedPrefixes: null,
                            items: ({ query }) => filterCommands(self.commands(), query),
                            // The menu runs the command by itself, so what the suggestion makes of a choice is dropped.
                            command: () => undefined,
                            render: () => ({
                                onStart: (props) => self.openSlash(props),
                                onUpdate: (props) => self.openSlash(props),
                                onKeyDown: ({ event }) => self.slashKey(event),
                                onExit: () => self.closeSlash()
                            })
                        })
                    ];
                }
            });
            const Blocks = core.Extension.create({
                name: 'blockMoves',
                addKeyboardShortcuts() {
                    return { 'Alt-ArrowUp': () => self.moveBlock(-1), 'Alt-ArrowDown': () => self.moveBlock(1) };
                }
            });

            this.editor = new core.Editor({
                element: this.contentRef().nativeElement,
                extensions: [
                    starter.default.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto', 'tel'] } }),
                    list.TaskList,
                    list.TaskItem.configure({ nested: true }),
                    image.default.configure({ allowBase64: true }),
                    extensions.Placeholder.configure({ placeholder: () => this.placeholder() }),
                    Slash,
                    Blocks
                ],
                content: this.toContent(this.value()),
                editable: !this.locked(),
                autofocus: this.autofocus() ? 'end' : false,
                onUpdate: ({ editor }) => this.afterUpdate(editor),
                onSelectionUpdate: ({ editor }) => this.afterSelection(editor),
                onFocus: ({ editor }) => {
                    this.focused.set(true);
                    // A selection made before the focus arrived has its toolbar now.
                    this.afterSelection(editor);
                },
                onBlur: () => {
                    this.focused.set(false);
                    this.onModelTouched();
                    this.touch.emit();

                    // A click on the toolbar keeps the focus in the editor; anything else closes it.
                    setTimeout(() => {
                        if (!this.focused() && !this.linking()) this.bubble.set(null);
                    }, 150);
                }
            });
            this.isEmpty.set(this.editor.isEmpty);
            this.ready.emit(this.editor);
        } catch (error) {
            this.failed.emit(error instanceof Error ? error.message : 'The editor could not be started');
        }
    }

    private toContent(value: BlockValue): BlockContent | string {
        if (value == null || value === '') return EMPTY_DOC;

        return value;
    }

    private setFromOutside(next: BlockValue): void {
        const editor = this.editor;

        if (!editor || next === this.lastEmitted) return;

        this.lastEmitted = next;
        // `emitUpdate` is off so that putting a value in is not taken for the user changing it.
        editor.commands.setContent(this.toContent(next), { emitUpdate: false });
        this.isEmpty.set(editor.isEmpty);
    }

    private afterUpdate(editor: Editor): void {
        const empty = editor.isEmpty;
        const json = editor.getJSON() as BlockContent;
        const next: BlockValue = empty ? null : this.format() === 'html' ? editor.getHTML() : json;

        this.isEmpty.set(empty);
        this.lastEmitted = next;
        this.value.set(next);
        this.onModelChange(next);
        this.changed.emit({ json, html: editor.getHTML(), empty });
        this.afterSelection(editor);
    }

    private afterSelection(editor: Editor): void {
        const { from, to, empty } = editor.state.selection;

        this.activeMarks.set({ bold: editor.isActive('bold'), italic: editor.isActive('italic'), strike: editor.isActive('strike'), code: editor.isActive('code'), link: editor.isActive('link') });

        if (!this.bubbleMenu() || this.locked() || empty || !editor.view.hasFocus() || this.slash() || editor.isActive('image') || editor.isActive('codeBlock')) {
            if (!this.linking()) this.bubble.set(null);

            return;
        }

        const host = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const left = Math.min(start.left, end.left);
        const right = Math.max(start.right, end.right);

        this.bubble.set({ x: Math.min(Math.max((left + right) / 2 - host.left, 100), Math.max(host.width - 100, 100)), y: start.top - host.top - 8 });
    }

    // ---------------------------------------------------------------------------------------------
    // Slash menu
    // ---------------------------------------------------------------------------------------------

    private openSlash(props: { items: BlockCommand[]; range: Range; clientRect?: (() => DOMRect | null) | null }): void {
        const rect = props.clientRect?.();
        const host = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
        const prev = this.slash();

        this.bubble.set(null);
        this.slash.set({
            items: props.items,
            // The highlighted entry stays where it was while the list is the same length or longer.
            index: prev && prev.index < props.items.length ? prev.index : 0,
            x: rect ? Math.min(Math.max(rect.left - host.left, 0), Math.max(host.width - 260, 0)) : 0,
            y: rect ? rect.bottom - host.top + 4 : 0,
            range: props.range
        });
    }

    private closeSlash(): void {
        this.slash.set(null);
    }

    private slashKey(event: KeyboardEvent): boolean {
        const s = this.slash();

        if (!s) return false;

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            this.slash.set({ ...s, index: stepIndex(s.index, s.items.length, event.key === 'ArrowDown' ? 1 : -1) });

            return true;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
            const item = s.items[s.index];

            if (item) this.runSlash(item, s.range);

            return true;
        }

        if (event.key === 'Escape') {
            this.slash.set(null);

            return true;
        }

        return false;
    }

    protected hoverSlash(index: number): void {
        const s = this.slash();

        if (s) this.slash.set({ ...s, index });
    }

    /** Turns the line the `/` was typed on into a block. */
    protected runSlash(item: BlockCommand, range: Range): void {
        const editor = this.editor;

        if (!editor) return;

        const chain = () => editor.chain().focus().deleteRange(range);

        this.slash.set(null);
        this.run(item.id, chain);
    }

    /** Makes a block of a kind, by its id, from a chain that has already cleared what typed it. */
    private run(id: string, chain: () => ReturnType<Editor['chain']>): void {
        switch (id) {
            case 'paragraph':
                chain().setParagraph().run();
                break;
            case 'heading1':
            case 'heading2':
            case 'heading3':
                chain()
                    .setNode('heading', { level: Number(id.slice(-1)) })
                    .run();
                break;
            case 'bulletList':
                chain().toggleBulletList().run();
                break;
            case 'orderedList':
                chain().toggleOrderedList().run();
                break;
            case 'taskList':
                chain().toggleTaskList().run();
                break;
            case 'blockquote':
                chain().setBlockquote().run();
                break;
            case 'codeBlock':
                chain().setCodeBlock().run();
                break;
            case 'divider':
                chain().setHorizontalRule().run();
                break;
            case 'image':
                chain().run();
                this.imageInput().nativeElement.click();
                break;
            default:
                // A command the app added is the app's to run, through the editor it gets from `ready`.
                chain().run();
        }
    }

    /**
     * Turns the block with the cursor into a kind, by the id of a slash entry: `paragraph`, `heading1`, `heading2`, `heading3`,
     * `bulletList`, `orderedList`, `taskList`, `blockquote`, `codeBlock` or `divider`.
     */
    setBlock(id: string): void {
        const editor = this.editor;

        if (editor) this.run(id, () => editor.chain().focus());
    }

    // ---------------------------------------------------------------------------------------------
    // Marks and links
    // ---------------------------------------------------------------------------------------------

    protected toggle(mark: 'bold' | 'italic' | 'strike' | 'code'): void {
        const chain = this.editor?.chain().focus();

        if (!chain) return;

        ({ bold: () => chain.toggleBold(), italic: () => chain.toggleItalic(), strike: () => chain.toggleStrike(), code: () => chain.toggleCode() })[mark]().run();
    }

    protected startLink(): void {
        this.linkValue.set((this.editor?.getAttributes('link')['href'] as string | undefined) ?? '');
        this.linking.set(true);
    }

    protected onLinkKey(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.applyLink();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.linking.set(false);
            this.editor?.commands.focus();
        }
    }

    protected applyLink(): void {
        const url = normalizeUrl(this.linkValue());

        this.linking.set(false);

        if (!url) return void this.editor?.commands.focus();

        this.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }

    protected removeLink(): void {
        this.linking.set(false);
        this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    }

    // ---------------------------------------------------------------------------------------------
    // Pictures
    // ---------------------------------------------------------------------------------------------

    protected onImagePicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = '';

        if (file) void this.addImageFile(file);
    }

    /** Puts a picture file in the document, at the cursor. */
    async addImageFile(file: File): Promise<void> {
        const request: BlockImageRequest = { file };

        this.imageRequested.emit(request);

        let url: string | undefined;

        try {
            const supplied = request.url ? await request.url : undefined;
            const uploader = this.uploadImage();

            url = supplied ?? (uploader ? await uploader(file) : await this.readAsDataUrl(file));
        } catch (error) {
            this.failed.emit(error instanceof Error ? error.message : 'The picture could not be added');

            return;
        }

        this.insertImage(url, file.name);
    }

    /** Puts a picture in the document, at the cursor, from its address. */
    insertImage(src: string, alt = ''): void {
        this.editor?.chain().focus().setImage({ src, alt }).run();
    }

    private readAsDataUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('The picture could not be read'));
            reader.readAsDataURL(file);
        });
    }

    // ---------------------------------------------------------------------------------------------
    // Blocks
    // ---------------------------------------------------------------------------------------------

    /** Swaps the top level block with the cursor with the one before it or after it. */
    private moveBlock(by: -1 | 1): boolean {
        const editor = this.editor;

        if (!editor || this.locked()) return false;

        const { state, view } = editor;
        const { $from } = state.selection;
        const index = $from.index(0);
        const target = index + by;

        if (target < 0 || target >= state.doc.childCount) return true;

        const doc = state.doc;
        const first = Math.min(index, target);
        let start = 0;

        for (let i = 0; i < first; i++) start += doc.child(i).nodeSize;

        const a = doc.child(first);
        const b = doc.child(first + 1);
        const end = start + a.nodeSize + b.nodeSize;
        // The cursor goes with its block: its offset inside the block is kept.
        const offset = $from.pos - $from.start(1) + 1;
        const tr = state.tr.replaceWith(start, end, [b, a]);
        const moved = by === 1 ? start + b.nodeSize : start;
        const selectionClass = state.selection.constructor as unknown as { near: (pos: ReturnType<typeof tr.doc.resolve>) => typeof state.selection };

        tr.setSelection(selectionClass.near(tr.doc.resolve(Math.min(moved + offset, tr.doc.content.size))));
        view.dispatch(tr.scrollIntoView());

        return true;
    }

    /** Moves the block with the cursor up. */
    moveBlockUp(): void {
        this.moveBlock(-1);
    }

    /** Moves the block with the cursor down. */
    moveBlockDown(): void {
        this.moveBlock(1);
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** The Tiptap editor, for what the component does not cover. `null` until it has started. */
    getEditor(): Editor | null {
        return this.editor;
    }

    /** The document as a tree. */
    getJSON(): BlockContent {
        return (this.editor?.getJSON() as BlockContent) ?? EMPTY_DOC;
    }

    /** The document as HTML. */
    getHTML(): string {
        return this.editor?.getHTML() ?? '';
    }

    /** The document as plain text, with a blank line between blocks. */
    getText(): string {
        return this.editor?.getText({ blockSeparator: '\n\n' }) ?? '';
    }

    /** Replaces the document. */
    setContent(content: BlockContent | string): void {
        this.editor?.commands.setContent(content, { emitUpdate: true });
    }

    /** Empties the document. */
    clear(): void {
        this.editor?.chain().clearContent(true).run();
    }

    /** Goes back one change. */
    undo(): void {
        this.editor?.chain().focus().undo().run();
    }

    /** Goes forward again after an undo. */
    redo(): void {
        this.editor?.chain().focus().redo().run();
    }

    /** Moves the focus into the document. A signal form calls it to focus the field. */
    focus(options?: FocusOptions): void {
        this.editor?.commands.focus('end', { scrollIntoView: !options?.preventScroll });
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [BlockEditor, SharedModule],
    exports: [BlockEditor, SharedModule]
})
export class BlockEditorModule {}
