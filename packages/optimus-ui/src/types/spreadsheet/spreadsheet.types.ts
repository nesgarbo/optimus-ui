import type { PassThrough, PassThroughOption } from '@openng/optimus-ui/api';

/**
 * A workbook as Univer writes it: sheets, cells, styles and so on. Treat it as opaque when it is stored and restored.
 * @group Interface
 */
export interface SpreadsheetData {
    id?: string;
    name?: string;
    locale?: string;
    sheetOrder?: string[];
    sheets?: Record<string, SpreadsheetSheet>;
    styles?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * One sheet of a workbook.
 * @group Interface
 */
export interface SpreadsheetSheet {
    id?: string;
    name?: string;
    rowCount?: number;
    columnCount?: number;
    /** Cells by row, then by column. A cell holds its value in `v` and its formula in `f`. */
    cellData?: Record<number, Record<number, SpreadsheetCell>>;
    [key: string]: unknown;
}

/**
 * One cell: `v` is the value, `f` the formula that makes it, `t` the type of the value, `s` the style.
 * @group Interface
 */
export interface SpreadsheetCell {
    v?: string | number | boolean | null;
    f?: string;
    t?: number;
    s?: string | Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * The languages the interface is translated into.
 * @group Types
 */
export type SpreadsheetLocale = 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR' | 'ru-RU' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'zh-TW' | 'ca-ES' | 'pl-PL' | 'id-ID' | 'vi-VN' | 'ar-SA' | 'fa-IR' | 'sk-SK' | 'zh-HK';

/**
 * Event of `changed`.
 * @group Events
 */
export interface SpreadsheetChangeEvent {
    /** The workbook as it is now. */
    data: SpreadsheetData;
}

/**
 * Pass-through options.
 * @group Interface
 */
export interface SpreadsheetPassThroughOptions {
    root?: PassThroughOption<HTMLElement, any>;
    container?: PassThroughOption<HTMLElement, any>;
}

/**
 * @group Interface
 */
export type SpreadsheetPassThrough<I = unknown> = PassThrough<I, SpreadsheetPassThroughOptions>;
