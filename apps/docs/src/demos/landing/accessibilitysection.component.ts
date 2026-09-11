import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CONTAINER, EYEBROW, HEADING, LEDE, SECTION, TWO_COLUMNS } from './sectionshell';

interface Topic {
    key: string;
    title: string;
    description: string;
    /** Keys this topic lights up on the keyboard, so the drawing explains the text. */
    keys: string[];
}

@Component({
    selector: 'accessibility-section',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section [class]="section" aria-labelledby="accessibility-heading">
            <div [class]="container">
                <span [class]="eyebrow">Accessibility</span>
                <h2 id="accessibility-heading" [class]="heading">Accessible by Default</h2>
                <p [class]="lede">WCAG compliant. Every component handles keyboard, screen readers and focus out of the box.</p>

                <div [class]="'mt-12 ' + columns">
                    <ul class="flex min-w-0 flex-col gap-2">
                        @for (topic of topics; track topic.key) {
                            <li>
                                <button
                                    type="button"
                                    class="w-full rounded-xl border p-4 text-start transition-colors"
                                    [class]="active() === topic.key ? 'border-surface-300 bg-surface-0 dark:border-surface-700 dark:bg-surface-900' : 'border-transparent hover:bg-surface-0 dark:hover:bg-surface-900'"
                                    [attr.aria-pressed]="active() === topic.key"
                                    (click)="active.set(topic.key)"
                                >
                                    <span class="block text-sm font-medium text-surface-900 dark:text-surface-0">{{ topic.title }}</span>
                                    <span class="mt-1 block text-sm text-muted-color">{{ topic.description }}</span>
                                </button>
                            </li>
                        }
                    </ul>

                    <!--
                        Keyboard, drawn in CSS. The active topic highlights the keys it uses.
                        Every key is a multiple of one unit, and the unit shrinks with the
                        viewport: at fixed sizes the widest row was wider than a phone, and
                        the keyboard turned into something to scroll sideways.
                    -->
                    <div class="min-w-0 overflow-x-auto rounded-xl border border-surface bg-surface-0 p-3 [--kbd-unit:0.74rem] sm:p-6 sm:[--kbd-unit:1rem] dark:bg-surface-900" aria-hidden="true">
                        <div class="flex min-w-full flex-col gap-1 sm:gap-1.5">
                            @for (row of rows; track $index) {
                                <div class="flex justify-center gap-1 sm:gap-1.5">
                                    @for (key of row; track key.label) {
                                        <span
                                            class="inline-flex h-7 shrink-0 items-center justify-center rounded-md border text-[10px] transition-colors sm:h-8"
                                            [style.flex-grow]="key.grow"
                                            [class]="highlighted(key.label) ? 'border-primary bg-primary text-primary-contrast' : 'border-surface-200 bg-surface-50 text-surface-500 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400'"
                                            [style.min-width]="unit(key.width)"
                                        >
                                            {{ key.label }}
                                        </span>
                                    }
                                </div>
                            }
                        </div>
                        <p class="mt-4 text-center text-xs text-muted-color">{{ activeTopic().title }}</p>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class AccessibilitySectionComponent {
    readonly section = SECTION;
    readonly container = CONTAINER;
    readonly eyebrow = EYEBROW;
    readonly heading = HEADING;
    readonly lede = LEDE;
    readonly columns = TWO_COLUMNS;

    topics: Topic[] = [
        { key: 'keyboard', title: 'Keyboard Navigation', description: 'Tab, arrow keys, Home, End, Enter and Escape behave the way the WAI-ARIA pattern says they should.', keys: ['Tab', '←', '↓', '→', 'Enter', 'Esc'] },
        { key: 'reader', title: 'Screen Reader', description: 'Semantic markup and live regions announce state changes as they happen.', keys: ['Ctrl', 'Alt', 'Space'] },
        { key: 'aria', title: 'ARIA Attributes', description: 'Roles, states and relationships are applied and kept in sync for you.', keys: ['Shift', 'Tab'] },
        { key: 'focus', title: 'Focus Management', description: 'Overlays trap focus, restore it on close, and every control shows a visible ring.', keys: ['Tab', 'Esc'] }
    ];

    active = signal(this.topics[0].key);

    rows = [
        [{ label: 'Esc', width: 2.5, grow: 0 }, ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((label) => ({ label, width: 2, grow: 0 }))],
        [{ label: 'Tab', width: 3, grow: 0 }, ...['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((label) => ({ label, width: 2, grow: 0 }))],
        [{ label: 'Caps', width: 3.5, grow: 0 }, ...['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((label) => ({ label, width: 2, grow: 0 })), { label: 'Enter', width: 3.5, grow: 0 }],
        [{ label: 'Shift', width: 4, grow: 0 }, ...['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((label) => ({ label, width: 2, grow: 0 })), { label: '↑', width: 2, grow: 0 }, { label: 'Shift', width: 3, grow: 0 }],
        [
            { label: 'Ctrl', width: 3, grow: 0 },
            { label: 'Alt', width: 2.5, grow: 0 },
            { label: 'Space', width: 8, grow: 1 },
            { label: 'Alt', width: 2.5, grow: 0 },
            { label: '←', width: 2, grow: 0 },
            { label: '↓', width: 2, grow: 0 },
            { label: '→', width: 2, grow: 0 }
        ]
    ];

    activeTopic = () => this.topics.find((topic) => topic.key === this.active()) ?? this.topics[0];

    /** A key's width, in units of whatever the viewport makes a unit. */
    unit(width: number) {
        return `calc(var(--kbd-unit) * ${width})`;
    }

    highlighted(label: string) {
        return this.activeTopic().keys.includes(label);
    }
}
