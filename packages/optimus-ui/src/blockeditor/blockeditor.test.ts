import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BlockContent } from '@openng/optimus-ui/types/blockeditor';
import { BlockEditor, type BlockValue } from './blockeditor';

const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const doc = (...blocks: BlockContent[]): BlockContent => ({ type: 'doc', content: blocks });
const p = (text: string): BlockContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });

@Component({
    standalone: true,
    imports: [BlockEditor],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-blockeditor
        [(value)]="value"
        [format]="format()"
        [readonly]="locked()"
        [uploadImage]="upload"
        [messages]="messages()"
        (changed)="changes.push($event.html)"
        (imageRequested)="requests = requests + 1"
        (touch)="touched = touched + 1"
    />`
})
class Host {
    readonly editor = viewChild.required(BlockEditor);
    value = signal<BlockValue>(doc(p('Hello'), p('World')));
    format = signal<'json' | 'html'>('json');
    locked = signal(false);
    messages = signal<Record<string, string>>({});
    changes: string[] = [];
    requests = 0;
    touched = 0;
    upload = async (file: File) => `https://img.test/${file.name}`;
}

@Component({
    standalone: true,
    imports: [BlockEditor, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p-blockeditor [formField]="f.body" format="html" />`
})
class FormHost {
    readonly editor = viewChild.required(BlockEditor);
    model = signal<{ body: BlockValue }>({ body: '<p>From the form</p>' });
    f = form(this.model);
}

describe('BlockEditor', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    const root = () => fixture.nativeElement as HTMLElement;
    const ed = () => host.editor();
    const tip = () => ed().getEditor()!;
    const settle = async () => {
        await fixture.whenStable();
        await wait();
        await fixture.whenStable();
    };
    const type = async (text: string) => {
        tip().commands.focus('end');
        tip().commands.insertContent(text);
        await settle();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host, FormHost], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        document.body.appendChild(fixture.nativeElement);
        await fixture.whenStable();

        for (let i = 0; i < 30 && !ed().getEditor(); i++) await wait(100);

        await settle();
    });

    it('shows the document it is given', () => {
        expect(root().querySelectorAll('.ProseMirror p')).toHaveLength(2);
        expect(ed().getText()).toBe('Hello\n\nWorld');
        expect(ed().isEmpty()).toBe(false);
    });

    it('puts what is typed into the value, as a tree, and says so', async () => {
        await type(' there');

        const value = host.value() as BlockContent;

        expect(value.content?.[1].content?.[0].text).toBe('World there');
        expect(host.changes.at(-1)).toContain('World there');
    });

    it('can hold the value as HTML', async () => {
        host.format.set('html');
        await settle();
        await type('!');

        expect(typeof host.value()).toBe('string');
        expect(host.value()).toBe('<p>Hello</p><p>World!</p>');
    });

    it('takes a new value from outside, and does not hand it back as a change', async () => {
        const before = host.changes.length;

        host.value.set(doc(p('Replaced')));
        await settle();

        expect(ed().getText()).toBe('Replaced');
        expect(host.changes).toHaveLength(before);
    });

    it('is empty with null, and null again when everything is deleted', async () => {
        host.value.set(null);
        await settle();
        expect(ed().isEmpty()).toBe(true);

        await type('x');
        expect(host.value()).not.toBeNull();

        ed().clear();
        await settle();
        expect(host.value()).toBeNull();
    });

    describe('slash menu', () => {
        const items = () => [...root().querySelectorAll('.p-blockeditor-slash-item')].map((e) => e.textContent!.replace(/\s+/g, ' ').trim());

        it('opens when / is typed, with every block', async () => {
            await type('/');

            expect(root().querySelector('.p-blockeditor-slash')).not.toBeNull();
            expect(items()).toHaveLength(11);
            expect(items()[0]).toContain('Text');
        });

        it('narrows as the query is typed, and Enter makes the block and removes what was typed', async () => {
            await type('/head');

            expect(items()).toHaveLength(3);
            expect(items().map((t) => t.includes('Heading'))).toEqual([true, true, true]);

            tip().view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            await settle();
            tip().view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await settle();

            // A block that is not text is followed by an empty paragraph to type in.
            const last = (host.value() as BlockContent).content!.find((b) => b.type === 'heading')!;

            expect(last.type).toBe('heading');
            expect(last.attrs?.['level']).toBe(2);
            expect(JSON.stringify(last)).not.toContain('/head');
            expect(root().querySelector('.p-blockeditor-slash')).toBeNull();
        });

        it('makes a block from a click', async () => {
            await type('/todo');
            expect(items()).toHaveLength(1);

            (root().querySelector('.p-blockeditor-slash-item') as HTMLElement).click();
            await settle();

            expect(JSON.stringify(host.value())).toContain('taskList');
            expect(root().querySelector('ul[data-type="taskList"]')).not.toBeNull();
        });

        it('says when no block matches, and closes on Escape', async () => {
            await type('/zzzz');
            expect(root().querySelector('.p-blockeditor-slash-empty')).not.toBeNull();

            tip().view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await settle();
            expect(root().querySelector('.p-blockeditor-slash')).toBeNull();
        });

        it('makes every kind of block', async () => {
            for (const [id, expected] of [
                ['heading1', 'h1'],
                ['bulletList', 'ul'],
                ['orderedList', 'ol'],
                ['blockquote', 'blockquote'],
                ['codeBlock', 'pre'],
                ['divider', 'hr']
            ] as const) {
                host.value.set(doc(p('x')));
                await settle();
                tip().commands.focus('end');
                ed().setBlock(id);
                await settle();

                expect(root().querySelector(`.ProseMirror ${expected}`), id).not.toBeNull();
            }
        });
    });

    describe('selection toolbar', () => {
        const select = async () => {
            tip().commands.focus();
            tip().commands.setTextSelection({ from: 1, to: 6 });
            await settle();
        };

        it('opens over a selection and not over a cursor', async () => {
            tip().commands.focus();
            tip().commands.setTextSelection(3);
            await settle();
            expect(root().querySelector('.p-blockeditor-bubble')).toBeNull();

            await select();
            expect(root().querySelector('.p-blockeditor-bubble')).not.toBeNull();
        });

        it('makes the selection bold, and says which marks are on', async () => {
            await select();
            (root().querySelector('[aria-label="Bold"]') as HTMLElement).click();
            await settle();

            expect(ed().getHTML()).toContain('<strong>Hello</strong>');
            expect(root().querySelector('[aria-label="Bold"]')?.getAttribute('aria-pressed')).toBe('true');
        });

        it('makes a link, adding the scheme to a bare address, and refuses what could run code', async () => {
            await select();
            (root().querySelector('[aria-label="Link"]') as HTMLElement).click();
            await settle();

            const input = root().querySelector('.p-blockeditor-bubble input') as HTMLInputElement;

            input.value = 'example.com/docs';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await settle();

            expect(ed().getHTML()).toContain('href="https://example.com/docs"');

            await select();
            (root().querySelector('[aria-label="Link"]') as HTMLElement).click();
            await settle();

            const again = root().querySelector('.p-blockeditor-bubble input') as HTMLInputElement;

            again.value = 'javascript:alert(1)';
            again.dispatchEvent(new Event('input'));
            again.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await settle();

            expect(ed().getHTML()).not.toContain('javascript');
        });
    });

    it('moves a block up and down with the keys, the cursor going with it', async () => {
        tip().commands.focus('end');
        tip().view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
        await settle();

        expect(ed().getText()).toBe('World\n\nHello');
        expect(tip().state.selection.$from.parent.textContent).toBe('World');

        ed().moveBlockDown();
        await settle();
        expect(ed().getText()).toBe('Hello\n\nWorld');

        // At the edge it stays.
        ed().moveBlockDown();
        await settle();
        expect(ed().getText()).toBe('Hello\n\nWorld');
    });

    it('puts the textbox role on the editable element, and the open menu on it', async () => {
        const dom = tip().view.dom;

        expect(dom.getAttribute('role')).toBe('textbox');
        expect(dom.getAttribute('aria-label')).toBeTruthy();
        expect(root().querySelectorAll('[role="textbox"]')).toHaveLength(1);

        await type('/');

        const list = root().querySelector('[role="listbox"]')!;

        expect(dom.getAttribute('aria-controls')).toBe(list.id);
        expect(
            root()
                .querySelector(`#${dom.getAttribute('aria-activedescendant')}`)
                ?.getAttribute('role')
        ).toBe('option');
    });

    it('names the menu and the editor in English, and from `messages` when given', async () => {
        await type('/');
        expect(root().querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Blocks');

        host.messages.set({ blocks: 'Bloques', editor: 'Editor de texto' });
        await settle();

        expect(root().querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Bloques');
        expect(tip().view.dom.getAttribute('aria-label')).toBe('Editor de texto');
    });

    it('moves a block that is selected as a whole', async () => {
        tip().commands.focus('end');
        tip().chain().focus().setHorizontalRule().run();
        await settle();

        const before = ed()
            .getJSON()
            .content!.map((b) => b.type);

        tip().commands.setNodeSelection(tip().state.doc.content.size - tip().state.doc.lastChild!.nodeSize);
        tip().view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
        await settle();

        expect(
            ed()
                .getJSON()
                .content!.map((b) => b.type)
        ).not.toEqual(before);
    });

    describe('drag handle', () => {
        const names = () => ed().getText().split('\n\n');

        beforeEach(async () => {
            host.value.set(doc(p('one'), p('two'), p('three')));
            await settle();
        });

        it('moves a block before another, counting the blocks as they are now', async () => {
            ed().moveBlockTo(0, 3);
            expect(names()).toEqual(['two', 'three', 'one']);

            ed().moveBlockTo(2, 0);
            expect(names()).toEqual(['one', 'two', 'three']);

            ed().moveBlockTo(1, 3);
            expect(names()).toEqual(['one', 'three', 'two']);

            // Where it already is, and out of range, nothing moves.
            ed().moveBlockTo(1, 1);
            ed().moveBlockTo(1, 2);
            ed().moveBlockTo(9, 0);
            expect(names()).toEqual(['one', 'three', 'two']);
            await settle();
            expect(JSON.stringify(host.value())).toContain('"three"');
        });

        it('shows a handle by the block under the pointer', async () => {
            const blocks = [...root().querySelectorAll('.ProseMirror > p')] as HTMLElement[];
            const box = blocks[1].getBoundingClientRect();

            root()
                .querySelector('p-blockeditor')!
                .dispatchEvent(new PointerEvent('pointermove', { clientX: box.left + 5, clientY: box.top + 3, bubbles: true }));
            await settle();

            const handle = root().querySelector('.p-blockeditor-handle') as HTMLElement;

            expect(handle).not.toBeNull();
            expect(Math.abs(handle.getBoundingClientRect().top - box.top)).toBeLessThan(12);
        });

        it('drags a block by its handle and drops it where the line shows', async () => {
            const blocks = [...root().querySelectorAll('.ProseMirror > p')] as HTMLElement[];
            const first = blocks[0].getBoundingClientRect();
            const last = blocks[2].getBoundingClientRect();

            root()
                .querySelector('p-blockeditor')!
                .dispatchEvent(new PointerEvent('pointermove', { clientX: first.left + 5, clientY: first.top + 3, bubbles: true }));
            await settle();

            const handle = root().querySelector('.p-blockeditor-handle') as HTMLElement;

            handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 5, clientY: first.top + 3 }));
            handle.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 5, clientY: last.bottom + 10 }));
            await settle();
            expect(root().querySelector('.p-blockeditor-drop')).not.toBeNull();

            handle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
            await settle();

            expect(names()).toEqual(['two', 'three', 'one']);
            expect(root().querySelector('.p-blockeditor-drop')).toBeNull();
        });

        it('does not show a handle when it is read only', async () => {
            host.locked.set(true);
            await settle();

            const box = (root().querySelector('.ProseMirror > p') as HTMLElement).getBoundingClientRect();

            root()
                .querySelector('p-blockeditor')!
                .dispatchEvent(new PointerEvent('pointermove', { clientX: box.left + 5, clientY: box.top + 3, bubbles: true }));
            await settle();
            expect(root().querySelector('.p-blockeditor-handle')).toBeNull();
        });
    });

    it('adds a picture from a file, through the uploader, and tells the app first', async () => {
        await ed().addImageFile(new File(['x'], 'cat.png', { type: 'image/png' }));
        await settle();

        expect(host.requests).toBe(1);
        expect(root().querySelector('img')?.getAttribute('src')).toBe('https://img.test/cat.png');
    });

    it('can be read and not changed', async () => {
        host.locked.set(true);
        await settle();

        expect(tip().isEditable).toBe(false);
        expect(root().querySelector('.p-blockeditor-readonly')).not.toBeNull();

        host.locked.set(false);
        await settle();
        expect(tip().isEditable).toBe(true);
    });

    it('says it was touched when it loses the focus', async () => {
        tip().commands.focus();
        await settle();
        (tip().view.dom as HTMLElement).blur();
        await settle();

        expect(host.touched).toBeGreaterThan(0);
    });

    it('is a field of a signal form', async () => {
        const f = TestBed.createComponent(FormHost);

        document.body.appendChild(f.nativeElement);
        await f.whenStable();

        for (let i = 0; i < 30 && !f.componentInstance.editor().getEditor(); i++) await wait(100);

        await wait();
        expect(f.nativeElement.querySelector('.ProseMirror p')?.textContent).toBe('From the form');

        f.componentInstance.editor().getEditor()!.chain().focus('end').insertContent('!').run();
        await wait();
        await f.whenStable();

        expect(f.componentInstance.model().body).toBe('<p>From the form!</p>');

        f.componentInstance.model.set({ body: '<p>Set from code</p>' });
        await wait();
        await f.whenStable();
        expect(f.nativeElement.querySelector('.ProseMirror p')?.textContent).toBe('Set from code');
    });
});
