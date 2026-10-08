import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { Mention, MentionModule } from './mention';

const people = [
    { name: 'Ana', id: 1, team: 'A' },
    { name: 'Andres', id: 2, team: 'B' },
    { name: 'Bea', id: 3, team: 'A' }
];

@Component({
    standalone: true,
    imports: [MentionModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-mention #m [dataSource]="people" [fields]="{ text: 'name', value: 'id' }" [showMentionChar]="show()" (itemSelect)="picked.push($event.text)" (opened)="opens = opens + 1" (closed)="closes = closes + 1">
            <textarea [(ngModel)]="text" id="ta"></textarea>
        </p-mention>
        <div id="ce" contenteditable="true"></div>
        <p-mention [dataSource]="people" [fields]="{ text: 'name', value: 'id' }" target="#ce" />
    `
})
class Host {
    readonly m = viewChild.required<Mention>('m');
    readonly people = people;
    text = '';
    readonly show = signal(true);
    readonly picked: string[] = [];
    opens = 0;
    closes = 0;
}

describe('Mention', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    let ta: HTMLTextAreaElement;

    const type = async (value: string) => {
        ta.focus();
        ta.value = value;
        ta.setSelectionRange(value.length, value.length);
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();
    };
    const rows = () => [...fixture.nativeElement.querySelectorAll('li[role="option"]')].map((e: Element) => e.textContent!.trim());
    const press = (key: string) => ta.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [Host], providers: [provideZonelessChangeDetection()] }).compileComponents();

        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await fixture.whenStable();
        ta = fixture.nativeElement.querySelector('#ta');
    });

    it('stays closed until the trigger is typed', async () => {
        await type('hello');

        expect(host.m().isOpen()).toBe(false);

        await type('hello @');
        expect(host.m().isOpen()).toBe(true);
        expect(rows()).toEqual(['Ana', 'Andres', 'Bea']);
        expect(host.opens).toBe(1);
    });

    it('narrows as the user types and closes when the mention ends', async () => {
        await type('hi @an');
        expect(rows()).toEqual(['Ana', 'Andres']);

        await type('hi @bx');
        expect(rows()).toEqual([]);
        expect(fixture.nativeElement.querySelector('.p-mention-empty').textContent).toContain('No records');

        await type('hi @bx ok');
        expect(host.m().isOpen()).toBe(false);
        expect(host.closes).toBe(1);
    });

    it('picks with the keyboard and updates ngModel', async () => {
        await type('hi @an');

        press('ArrowDown');
        press('Enter');
        await fixture.whenStable();

        expect(ta.value).toBe('hi @Andres ');
        expect(host.text).toBe('hi @Andres ');
        expect(host.picked).toEqual(['@Andres']);
        expect(host.m().isOpen()).toBe(false);
    });

    it('picks with a click, and omits the trigger when showMentionChar is off', async () => {
        host.show.set(false);
        await fixture.whenStable();
        await type('@b');

        (fixture.nativeElement.querySelector('li[role="option"]') as HTMLElement).click();
        await fixture.whenStable();

        expect(ta.value).toBe('Bea ');
    });

    it('escape closes, and the ARIA on the field follows the list', async () => {
        await type('@a');

        expect(ta.getAttribute('aria-expanded')).toBe('true');
        expect(ta.getAttribute('aria-activedescendant')).toMatch(/-0$/);
        expect(ta.getAttribute('aria-autocomplete')).toBe('list');

        press('Escape');
        await fixture.whenStable();

        expect(host.m().isOpen()).toBe(false);
        expect(ta.getAttribute('aria-expanded')).toBe('false');
    });

    it('does not open on an e-mail address', async () => {
        await type('write to ana@x');

        expect(host.m().isOpen()).toBe(false);
    });

    it('inserts a chip into a contenteditable target', async () => {
        const ce = fixture.nativeElement.querySelector('#ce') as HTMLElement;

        ce.focus();
        ce.textContent = 'hi @be';

        const range = document.createRange();

        range.setStart(ce.firstChild!, 6);
        range.collapse(true);
        document.getSelection()!.removeAllRanges();
        document.getSelection()!.addRange(range);
        ce.dispatchEvent(new Event('input', { bubbles: true }));
        await fixture.whenStable();

        const options = fixture.nativeElement.querySelectorAll('li[role="option"]');
        const bea = [...options].find((o: any) => o.textContent.trim() === 'Bea') as HTMLElement;

        bea.click();
        await fixture.whenStable();

        const chip = ce.querySelector('.p-mention-chip') as HTMLElement;

        expect(chip.textContent).toBe('Bea');
        expect(chip.dataset['mention']).toBe('3');
        expect(chip.contentEditable).toBe('false');
        expect(ce.textContent).toContain('hi ');
    });
});
