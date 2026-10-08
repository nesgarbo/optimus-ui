import { DomHandler } from './domhandler';

describe('DomHandler', () => {
    let host: HTMLElement;

    beforeEach(() => {
        host = document.createElement('div');
        host.innerHTML = `
            <ul class="list">
                <li class="a">A</li>
                <li class="b" data-group="x">B</li>
                <li class="c" data-group="x">C</li>
            </ul>
            <button class="ok">ok</button>
            <button class="off" disabled>off</button>
            <button class="skip" tabindex="-1">skip</button>
            <input class="field" />
            <span class="hid" style="display: none"><button class="inside-hidden">h</button></span>
        `;
        document.body.appendChild(host);
    });

    afterEach(() => {
        host.remove();
        document.body.classList.remove('p-overflow-hidden', 'custom-block');
    });

    describe('classes', () => {
        it('adds, tests and removes a class', () => {
            const a = host.querySelector('.a')!;

            DomHandler.addClass(a, 'x');
            expect(DomHandler.hasClass(a, 'x')).toBe(true);

            DomHandler.removeClass(a, 'x');
            expect(DomHandler.hasClass(a, 'x')).toBe(false);
        });

        it('ignores a missing element or class name', () => {
            const a = host.querySelector('.a')!;

            expect(() => DomHandler.addClass(null, 'x')).not.toThrow();
            DomHandler.addClass(a, '');
            expect(a.className).toBe('a');
            expect(DomHandler.hasClass(null, 'x')).toBe(false);
            expect(DomHandler.hasClass(a, '')).toBe(false);
        });

        it('adds several classes at once, and removes lists of them', () => {
            const a = host.querySelector('.a')!;

            DomHandler.addMultipleClasses(a, ' one two three ');
            expect(['one', 'two', 'three'].every((c) => a.classList.contains(c))).toBe(true);

            DomHandler.removeMultipleClasses(a, ['one two', undefined, 'three']);
            expect(a.className).toBe('a');
        });

        it('skips the empty tokens of a list with several spaces in a row', () => {
            const a = host.querySelector('.a')!;

            expect(() => DomHandler.addMultipleClasses(a, 'one  two\t\tthree')).not.toThrow();
            expect(['one', 'two', 'three'].every((c) => a.classList.contains(c))).toBe(true);
        });
    });

    describe('queries', () => {
        it('finds elements below another', () => {
            expect(DomHandler.find(host, 'li').length).toBe(3);
            expect(DomHandler.findSingle(host, '.b')).toBe(host.querySelector('.b'));
            expect(DomHandler.findSingle(host, '.nothing')).toBeNull();
            expect(DomHandler.findSingle(null, '.b')).toBeNull();
        });

        it('lists siblings, and the index of an element among its element siblings', () => {
            const b = host.querySelector('.b')!;

            expect(DomHandler.siblings(b).map((e: Element) => e.className)).toEqual(['a', 'c']);
            expect(DomHandler.index(b)).toBe(1);
            expect(DomHandler.index(host.querySelector('.c')!)).toBe(2);
        });

        it('counts the index within a group by an attribute', () => {
            expect(DomHandler.indexWithinGroup(host.querySelector('.c')!, 'data-group')).toBe(1);
            expect(DomHandler.indexWithinGroup(document.createElement('i'), 'data-group')).toBe(-1);
        });

        it('knows an element from something else, and whether it still exists', () => {
            expect(DomHandler.isElement(host)).toBe(true);
            expect(DomHandler.isElement({})).toBe(false);
            expect(DomHandler.isExist(host)).toBeTruthy();
            expect(DomHandler.isExist(document.createElement('div'))).toBeFalsy();
            expect(DomHandler.matches(host.querySelector('.a')!, 'ul > li.a')).toBe(true);
        });

        it('gets the parents of an element up to the document', () => {
            const parents = DomHandler.getParents(host.querySelector('.a')!);

            expect(parents[0]).toBe(host.querySelector('.list'));
            expect(parents[parents.length - 1]).toBe(document);
        });

        it('finds the parents that scroll', () => {
            host.style.overflow = 'auto';

            expect(DomHandler.getScrollableParents(host.querySelector('.a')!)).toContain(host);
            expect(DomHandler.getScrollableParents(null)).toEqual([]);
        });
    });

    describe('attributes', () => {
        it('reads an attribute as a number, a boolean or a string', () => {
            const el = document.createElement('div');

            el.setAttribute('n', '12');
            el.setAttribute('t', 'true');
            el.setAttribute('f', 'false');
            el.setAttribute('s', 'text');

            expect(DomHandler.getAttribute(el, 'n')).toBe(12);
            expect(DomHandler.getAttribute(el, 't')).toBe(true);
            expect(DomHandler.getAttribute(el, 'f')).toBe(false);
            expect(DomHandler.getAttribute(el, 's')).toBe('text');
            expect(DomHandler.getAttribute(undefined, 's')).toBeUndefined();
        });

        it('sets an attribute only when there is a value for it', () => {
            const el = document.createElement('div');

            DomHandler.setAttribute(el, 'a', 'b');
            DomHandler.setAttribute(el, 'c', null);
            DomHandler.setAttribute(el, 'd', undefined);

            expect(el.getAttribute('a')).toBe('b');
            expect(el.hasAttribute('c')).toBe(false);
            expect(el.hasAttribute('d')).toBe(false);
        });

        it('sets classes, styles and events from an object', () => {
            const el = document.createElement('div');
            const onClick = vi.fn();

            DomHandler.setAttributes(el, { class: ['a', { b: true, c: false }], style: { fontSize: '12px', color: null }, onClick, 'data-x': 1, skipped: undefined });
            el.dispatchEvent(new Event('click'));

            expect(el.getAttribute('class')).toBe('a b');
            expect(el.getAttribute('style')).toBe('font-size:12px');
            expect(el.getAttribute('data-x')).toBe('1');
            expect(el.hasAttribute('skipped')).toBe(false);
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('creates an element with attributes and children', () => {
            const child = document.createElement('b');
            const el = DomHandler.createElement('p', { class: 'x', id: 'y' }, 'text ', child)!;

            expect(el.tagName).toBe('P');
            expect(el.className).toBe('x');
            expect(el.id).toBe('y');
            expect(el.textContent).toBe('text ');
            expect(el.lastChild).toBe(child);
            expect(DomHandler.createElement('', {})).toBeUndefined();
        });
    });

    describe('focus', () => {
        it('lists the focusable elements that can be seen', () => {
            const classes = DomHandler.getFocusableElements(host).map((e: HTMLElement) => e.className);

            expect(classes).toEqual(['ok', 'field']);
        });

        it('gets the first and the last one, and the one after the focused one', () => {
            const ok = host.querySelector('.ok') as HTMLElement;
            const field = host.querySelector('.field') as HTMLElement;

            expect(DomHandler.getFirstFocusableElement(host)).toBe(ok);
            expect(DomHandler.getLastFocusableElement(host, '')).toBe(field);
            expect(DomHandler.getFocusableElement(host)).toBe(ok);
            expect(DomHandler.getFirstFocusableElement(document.createElement('div'))).toBeNull();

            ok.focus();
            expect(DomHandler.getNextFocusableElement(host)).toBe(field);
            expect(DomHandler.getNextFocusableElement(host, true)).toBe(field);

            field.focus();
            expect(DomHandler.getNextFocusableElement(host)).toBe(ok);
            expect(DomHandler.getNextFocusableElement(host, true)).toBe(ok);
        });

        it('tells whether an element is focusable', () => {
            expect(DomHandler.isFocusableElement(host.querySelector('.ok'))).toBe(true);
            expect(DomHandler.isFocusableElement(host.querySelector('.off'))).toBe(false);
            expect(DomHandler.isFocusableElement(host.querySelector('.skip'))).toBe(false);
            expect(DomHandler.isFocusableElement(null)).toBe(false);
        });

        it('focuses an element once', () => {
            const ok = host.querySelector('.ok') as HTMLElement;
            const focus = vi.spyOn(ok, 'focus');

            DomHandler.focus(ok);
            DomHandler.focus(ok);

            expect(document.activeElement).toBe(ok);
            expect(focus).toHaveBeenCalledTimes(1);
            expect(() => DomHandler.focus(null as any)).not.toThrow();
        });
    });

    describe('visibility and size', () => {
        it('tells a shown element from a hidden one', () => {
            expect(DomHandler.isVisible(host.querySelector('.ok') as HTMLElement)).toBeTruthy();
            expect(DomHandler.isHidden(host.querySelector('.ok') as HTMLElement)).toBe(false);
            expect(DomHandler.isHidden(host.querySelector('.inside-hidden') as HTMLElement)).toBe(true);
            expect(DomHandler.isHidden(null as any)).toBe(true);
        });

        it('measures the size of an element that is hidden', () => {
            const hidden = host.querySelector('.hid') as HTMLElement;

            hidden.style.width = '40px';
            hidden.style.height = '20px';
            hidden.style.display = 'none';

            expect(DomHandler.getHiddenElementOuterWidth(hidden)).toBe(40);
            expect(DomHandler.getHiddenElementOuterHeight(hidden)).toBe(20);
            expect(hidden.style.display).toBe('none');
        });

        it('reads the width and height of a box', () => {
            const box = document.createElement('div');

            box.style.cssText = 'width: 100px; height: 50px; padding: 5px; margin: 3px; box-sizing: content-box';
            host.appendChild(box);

            expect(DomHandler.getOuterWidth(box)).toBe(110);
            expect(DomHandler.getOuterWidth(box, true)).toBe(116);
            expect(DomHandler.getOuterHeight(box)).toBe(60);
            expect(DomHandler.getHeight(box)).toBe(50);
            expect(DomHandler.getWidth(box)).toBe(100);
            expect(DomHandler.getHorizontalPadding(box)).toBe(10);
            expect(DomHandler.getHorizontalMargin(box)).toBe(6);
        });

        it('reports the viewport and the scroll of the window', () => {
            const viewport = DomHandler.getViewport();

            expect(viewport.width).toBeGreaterThan(0);
            expect(viewport.height).toBeGreaterThan(0);
            expect(DomHandler.getWindowScrollTop()).toBeGreaterThanOrEqual(0);
            expect(DomHandler.getWindowScrollLeft()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('misc', () => {
        it('moves an element in and out of another', () => {
            const el = document.createElement('i');

            DomHandler.appendChild(el, host);
            expect(el.parentNode).toBe(host);

            DomHandler.removeChild(el, host);
            expect(el.parentNode).toBeNull();
        });

        it('replaces an element with another, and removes it', () => {
            const a = host.querySelector('.a') as HTMLElement;
            const replacement = document.createElement('li');

            DomHandler.replaceElementWith(a, replacement);
            expect(replacement.parentNode).toBe(host.querySelector('.list'));
            expect(a.parentNode).toBeNull();

            DomHandler.removeElement(replacement);
            expect(replacement.parentNode).toBeNull();
        });

        it('hands out growing z-indexes', () => {
            const first = DomHandler.generateZIndex();

            expect(DomHandler.generateZIndex()).toBe(first + 1);
        });

        it('blocks and unblocks the scroll of the page', () => {
            DomHandler.blockBodyScroll();
            expect(document.body.classList.contains('p-overflow-hidden')).toBe(true);
            expect(document.body.style.getPropertyValue('--scrollbar-width')).toMatch(/px$/);

            DomHandler.unblockBodyScroll();
            expect(document.body.classList.contains('p-overflow-hidden')).toBe(false);
            expect(document.body.style.getPropertyValue('--scrollbar-width')).toBe('');

            DomHandler.blockBodyScroll('custom-block');
            expect(document.body.classList.contains('custom-block')).toBe(true);
            DomHandler.unblockBodyScroll('custom-block');
        });

        it('knows it runs in a browser, and its scrollbar sizes', () => {
            expect(DomHandler.isClient()).toBe(true);
            expect(DomHandler.calculateScrollbarWidth()).toBeGreaterThanOrEqual(0);
            expect(DomHandler.calculateScrollbarHeight()).toBeGreaterThanOrEqual(0);
            expect(DomHandler.isInteger(3)).toBe(true);
            expect(DomHandler.isInteger(3.5)).toBe(false);
            expect(typeof DomHandler.getUserAgent()).toBe('string');
        });

        it('reads the selection as text, and clears it', () => {
            // The selection belongs to the page that has the focus, which another test file may hold, so it is doubled here.
            const selection = { toString: () => 'A', empty: vi.fn() };

            vi.spyOn(window, 'getSelection').mockReturnValue(selection as unknown as Selection);

            expect(DomHandler.getSelection()).toBe('A');

            DomHandler.clearSelection();
            expect(selection.empty).toHaveBeenCalledTimes(1);
        });
    });
});
