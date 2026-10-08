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
import type { SpreadsheetChangeEvent, SpreadsheetData, SpreadsheetLocale, SpreadsheetPassThrough } from '@openng/optimus-ui/types/spreadsheet';
import { findSheet, fromA1, sheetToRows, toCsv } from './spreadsheet-data';
import { SpreadsheetStyle } from './style/spreadsheetstyle';

export const SPREADSHEET_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Spreadsheet),
    multi: true
};

/** The parts of Univer's facade that are used. It is wide, and the component only needs a few of its methods. */
type UniverApi = any;
type UniverWorkbook = any;

/** Each language is its own chunk, so that only the one in use is downloaded. */
const LOCALES: Record<SpreadsheetLocale, { id: string; load: () => Promise<{ default: object }> }> = {
    'en-US': { id: 'enUS', load: () => import('@univerjs/preset-sheets-core/locales/en-US') },
    'es-ES': { id: 'esES', load: () => import('@univerjs/preset-sheets-core/locales/es-ES') },
    'fr-FR': { id: 'frFR', load: () => import('@univerjs/preset-sheets-core/locales/fr-FR') },
    'de-DE': { id: 'deDE', load: () => import('@univerjs/preset-sheets-core/locales/de-DE') },
    'it-IT': { id: 'itIT', load: () => import('@univerjs/preset-sheets-core/locales/it-IT') },
    'pt-BR': { id: 'ptBR', load: () => import('@univerjs/preset-sheets-core/locales/pt-BR') },
    'ru-RU': { id: 'ruRU', load: () => import('@univerjs/preset-sheets-core/locales/ru-RU') },
    'ja-JP': { id: 'jaJP', load: () => import('@univerjs/preset-sheets-core/locales/ja-JP') },
    'ko-KR': { id: 'koKR', load: () => import('@univerjs/preset-sheets-core/locales/ko-KR') },
    'zh-CN': { id: 'zhCN', load: () => import('@univerjs/preset-sheets-core/locales/zh-CN') },
    'zh-TW': { id: 'zhTW', load: () => import('@univerjs/preset-sheets-core/locales/zh-TW') },
    'zh-HK': { id: 'zhHK', load: () => import('@univerjs/preset-sheets-core/locales/zh-HK') },
    'ca-ES': { id: 'caES', load: () => import('@univerjs/preset-sheets-core/locales/ca-ES') },
    'pl-PL': { id: 'plPL', load: () => import('@univerjs/preset-sheets-core/locales/pl-PL') },
    'id-ID': { id: 'idID', load: () => import('@univerjs/preset-sheets-core/locales/id-ID') },
    'vi-VN': { id: 'viVN', load: () => import('@univerjs/preset-sheets-core/locales/vi-VN') },
    'ar-SA': { id: 'arSA', load: () => import('@univerjs/preset-sheets-core/locales/ar-SA') },
    'fa-IR': { id: 'faIR', load: () => import('@univerjs/preset-sheets-core/locales/fa-IR') },
    'sk-SK': { id: 'skSK', load: () => import('@univerjs/preset-sheets-core/locales/sk-SK') }
};

/** Univer's types of command: what the user asks for, and the changes that it is made of. */
const COMMAND = 0;
const MUTATION = 2;
/** How long after an edit a finished calculation is still taken to be its result, in milliseconds. */
const FOLLOW_MS = 5000;
/** Univer keeps the data its formulas work on by the id of the workbook, in the page and not in the instance. Two workbooks with the same id would share it, and one of them would be calculated with the other's cells. */
let unitCounter = 0;

/** How long to wait after the last change before the value is read out of the engine, in milliseconds. */
const SETTLE_MS = 350;

/**
 * Spreadsheet is a spreadsheet with formulas, number formats, a toolbar and many sheets, on top of Univer.
 *
 * The value is the workbook as Univer writes it, so it can be stored and restored; `rowsToWorkbook` makes one from a table of
 * rows. It binds to a signal form with `[formField]`, to a classic form, or two-way with `[(value)]`. `getCell`, `setCell`,
 * `getRows`, `setRows` and `toCsv` read and write cells from code, and `getApi` gives Univer's own API for the rest.
 *
 * Univer is an optional peer dependency, loaded when the first spreadsheet is shown, and its stylesheet
 * (`@univerjs/preset-sheets-core/lib/index.css`) has to be part of the application's styles.
 *
 * @group Components
 */
@Component({
    selector: 'p-spreadsheet',
    standalone: true,
    imports: [SharedModule, Bind],
    template: `<div #container [class]="cx('container')" [pBind]="ptm('container')"></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SpreadsheetStyle, SPREADSHEET_VALUE_ACCESSOR, { provide: PARENT_INSTANCE, useExisting: Spreadsheet }],
    host: { '[class]': 'cx("root")', 'data-scope': 'spreadsheet', 'data-part': 'root' },
    hostDirectives: [Bind]
})
export class Spreadsheet extends BaseEditableHolder<SpreadsheetPassThrough> {
    componentName = 'Spreadsheet';

    /** @internal */
    _componentStyle = inject(SpreadsheetStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });
    private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    // ---------------------------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------------------------

    /**
     * The workbook: its sheets, cells, formulas and formats, as Univer writes it. Supports `[(value)]`, `[formField]`, `formControl` and `ngModel`.
     * @group Props
     */
    readonly value = model<SpreadsheetData | null>(null);
    /**
     * Language of the interface.
     * @group Props
     */
    readonly locale = input<SpreadsheetLocale>('en-US');
    /**
     * Lets the workbook be read and not changed.
     * @group Props
     */
    readonly readonly = input(false, { transform: booleanAttribute });
    /**
     * Draws the sheet in dark colours.
     * @group Props
     */
    readonly darkMode = input(false, { transform: booleanAttribute });
    /**
     * Shows the toolbar.
     * @group Props
     */
    readonly toolbar = input(true, { transform: booleanAttribute });
    /**
     * Shows the bar where a formula is written.
     * @group Props
     */
    readonly formulaBar = input(true, { transform: booleanAttribute });
    /**
     * Shows the bar with the tabs of the sheets, and the zoom.
     * @group Props
     */
    readonly footer = input(true, { transform: booleanAttribute });
    /**
     * Shows the header with the menus.
     * @group Props
     */
    readonly header = input(true, { transform: booleanAttribute });
    /**
     * Name for assistive technology.
     * @group Props
     */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    // ---------------------------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------------------------

    /**
     * Emitted when the spreadsheet is ready, with Univer's API.
     * @group Emits
     */
    readonly created = output<unknown>();
    /**
     * Emitted a moment after the workbook changes, with the workbook as it is.
     * @group Emits
     */
    readonly changed = output<SpreadsheetChangeEvent>();
    /**
     * Emitted when the spreadsheet could not start.
     * @group Emits
     */
    readonly failed = output<string>();
    /**
     * Emitted when the control loses focus, for signal forms.
     * @group Emits
     */
    readonly touch = output<void>();

    /** `true` when the spreadsheet is ready. */
    readonly ready = signal(false);
    /** `true` when nothing can be changed. @internal */
    readonly locked = computed(() => this.readonly() || this.$disabled());

    private api: UniverApi | null = null;
    private univer: { dispose(): void } | null = null;
    private workbook: UniverWorkbook | null = null;
    private lastEmitted: SpreadsheetData | null | undefined = undefined;
    private timer: ReturnType<typeof setTimeout> | undefined;
    private generation = 0;
    private loading = false;
    private editedAt = 0;
    /** The id the data had before the engine was given its own. */
    private dataId: string | undefined;

    constructor() {
        super();

        afterNextRender(() => {
            void this.start();

            // A workbook from outside -- a form, a binding -- replaces the one that is open.
            effect(
                () => {
                    const next = this.value();

                    untracked(() => this.replace(next));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const locked = this.locked();

                    untracked(() => this.workbook?.setEditable(!locked));
                },
                { injector: this.injector }
            );
            effect(
                () => {
                    const dark = this.darkMode();

                    untracked(() => this.api?.toggleDarkMode?.(dark));
                },
                { injector: this.injector }
            );
        });

        this.destroyRef.onDestroy(() => {
            clearTimeout(this.timer);
            this.generation++;
            this.api?.dispose?.();
            this.univer = null;
            this.api = null;
            this.workbook = null;
        });
    }

    /** What a classic form writes in: the workbook, which the sheet then shows. */
    override writeControlValue(value: SpreadsheetData | null): void {
        this.value.set(value ?? null);
        this.cd.markForCheck();
    }

    // ---------------------------------------------------------------------------------------------
    // Univer
    // ---------------------------------------------------------------------------------------------

    private async start(): Promise<void> {
        if (!this.browser) return;

        const generation = ++this.generation;

        try {
            const locale = LOCALES[this.locale()] ?? LOCALES['en-US'];
            const [presets, core, strings] = await Promise.all([import('@univerjs/presets'), import('@univerjs/preset-sheets-core'), locale.load()]);

            if (generation !== this.generation) return;

            const { createUniver, defaultTheme, merge } = presets;
            const { univerAPI, univer } = createUniver({
                locale: locale.id as never,
                locales: { [locale.id]: merge({}, strings.default) } as never,
                theme: defaultTheme,
                darkMode: this.darkMode(),
                presets: [
                    core.UniverSheetsCorePreset({
                        container: this.container().nativeElement,
                        header: this.header(),
                        toolbar: this.toolbar(),
                        formulaBar: this.formulaBar(),
                        footer: this.footer() ? undefined : false
                    } as never)
                ]
            });

            this.api = univerAPI;
            this.univer = univer;
            this.open(this.value());

            (univerAPI as UniverApi).addEvent(univerAPI.Event.CommandExecuted, (command: { type?: number; id?: string }) => this.onCommand(command));
            this.container().nativeElement.addEventListener('focusout', (e) => {
                if (!this.container().nativeElement.contains(e.relatedTarget as Node | null)) {
                    this.onModelTouched();
                    this.touch.emit();
                }
            });
            this.ready.set(true);
            this.created.emit(univerAPI);
        } catch (error) {
            this.failed.emit(error instanceof Error ? error.message : 'The spreadsheet could not be started');
        }
    }

    /** Opens a workbook in the engine, in place of the one that is there. */
    private open(data: SpreadsheetData | null): void {
        const api = this.api;

        if (!api) return;

        this.loading = true;

        try {
            const previous = api.getActiveWorkbook?.();

            if (previous) api.disposeUnit(previous.getId());

            // An empty value is a new blank workbook. The language of the data is that of the interface, or its formats would be Chinese.
            // Each workbook that is opened gets an id of its own in the engine. The id in the data is put back when the data is read out.
            this.dataId = data?.id;
            this.workbook = api.createWorkbook({ locale: LOCALES[this.locale()]?.id ?? 'enUS', ...(data ?? {}), id: `${data?.id ?? 'workbook'}-${Date.now().toString(36)}-${unitCounter++}` });
            this.workbook?.setEditable?.(!this.locked());
            this.lastEmitted = data;
        } finally {
            // The commands that opened it are done by the time the engine is idle.
            setTimeout(() => (this.loading = false), 0);
        }
    }

    /**
     * What the user does is a command (`sheet.command.*`, or an undo); what it sets going -- the calculation of the formulas -- is a
     * string of mutations. Only commands count as a change, so that opening a workbook is not one; but a calculation that ends soon
     * after a command is part of it, and the value is read again once it has.
     */
    private onCommand(command: { type?: number; id?: string }): void {
        if (this.loading) return;

        const id = command.id ?? '';

        if (command.type === COMMAND && (id.startsWith('sheet.command.') || id === 'univer.command.undo' || id === 'univer.command.redo')) {
            this.editedAt = Date.now();
            this.schedule();
        } else if (command.type === MUTATION && id === 'formula.mutation.set-formula-calculation-result' && Date.now() - this.editedAt < FOLLOW_MS) {
            this.schedule();
        }
    }

    private replace(next: SpreadsheetData | null): void {
        if (!this.api || next === this.lastEmitted) return;

        this.open(next);
    }

    private schedule(): void {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.publish(), SETTLE_MS);
    }

    private publish(): void {
        const snapshot = this.getSnapshot();

        if (!snapshot) return;

        this.lastEmitted = snapshot;
        this.value.set(snapshot);
        this.onModelChange(snapshot);
        this.changed.emit({ data: snapshot });
    }

    // ---------------------------------------------------------------------------------------------
    // Methods
    // ---------------------------------------------------------------------------------------------

    /** Univer's own API, for what the component does not cover. `null` until the spreadsheet is ready. */
    getApi(): UniverApi | null {
        return this.api;
    }

    /** The workbook that is open, as Univer's `FWorkbook`. */
    getWorkbook(): UniverWorkbook | null {
        return this.workbook;
    }

    /** The workbook as it is now, with the values of its formulas. */
    getSnapshot(): SpreadsheetData | null {
        const snapshot = this.workbook?.save?.() as SpreadsheetData | undefined;

        if (!snapshot) return null;

        if (this.dataId === undefined) delete snapshot.id;
        else snapshot.id = this.dataId;

        return snapshot;
    }

    private sheetOf(sheet?: number | string): any {
        const wb = this.workbook;

        if (!wb) return null;
        if (sheet == null) return wb.getActiveSheet();
        if (typeof sheet === 'number') return wb.getSheets()[sheet] ?? null;

        return wb.getSheetByName(sheet) ?? wb.getSheetBySheetId?.(sheet) ?? null;
    }

    /** The value of a cell, by its address (`B2`). It is the result for a cell with a formula. */
    getCell(address: string, sheet?: number | string): unknown {
        return this.sheetOf(sheet)?.getRange(address).getValue() ?? null;
    }

    /** Puts a value in a cell, or a formula when it starts with `=`. */
    setCell(address: string, value: string | number | boolean | null, sheet?: number | string): void {
        const range = this.sheetOf(sheet)?.getRange(address);

        if (!range) return;

        if (typeof value === 'string' && value.startsWith('=')) range.setFormula(value);
        else range.setValue(value);
    }

    /** The values of a range as a table of rows. Without a range, everything that is filled in. */
    getRows(range?: string, sheet?: number | string): unknown[][] {
        const s = this.sheetOf(sheet);

        if (!s) return [];

        if (range) return s.getRange(range).getValues();

        const all = sheetToRows(findSheet(this.getSnapshot(), sheet ?? s.getSheetId()));

        return all;
    }

    /** Writes a table of rows from a cell, `A1` by default. A string that starts with `=` is a formula. */
    setRows(rows: readonly (readonly unknown[])[], from = 'A1', sheet?: number | string): void {
        const s = this.sheetOf(sheet);
        const start = fromA1(from);

        if (!s || !start || !rows.length) return;

        rows.forEach((row, r) =>
            row.forEach((value, c) => {
                if (value === null || value === undefined) return;

                const range = s.getRange(start.row + r, start.column + c);

                if (typeof value === 'string' && value.startsWith('=')) range.setFormula(value);
                else range.setValue(value as never);
            })
        );
    }

    /** A sheet as CSV. The sheet that is open when none is named. */
    toCsv(sheet?: number | string, separator = ','): string {
        return toCsv(this.getRows(undefined, sheet), separator);
    }

    /** The CSV as a `Blob`. */
    toCsvBlob(sheet?: number | string): Blob {
        return new Blob([this.toCsv(sheet)], { type: 'text/csv;charset=utf-8' });
    }

    /** Moves the focus into the sheet. A signal form calls it to focus the field. */
    focus(): void {
        this.container().nativeElement.querySelector<HTMLElement>('canvas, [tabindex]')?.focus();
    }
}

/**
 * @group Modules
 */
@NgModule({
    imports: [Spreadsheet, SharedModule],
    exports: [Spreadsheet, SharedModule]
})
export class SpreadsheetModule {}
