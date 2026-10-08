/**
 * The numbers behind a box plot: quartiles, whiskers and outliers from raw values, or the same five numbers read from a datum.
 *
 * Pure.
 *
 * @module boxplot
 */

/** How the quartiles are found. `exclusive` and `inclusive` take the median of each half, leaving the median out of the halves of an odd count or keeping it in; `linear` interpolates between ranks. */
export type QuartileMethod = 'exclusive' | 'inclusive' | 'linear';

/** What a box plot draws for one category. */
export interface BoxStats {
    /** The smallest and the largest value, outliers included. */
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
    mean?: number;
    /** Where the whiskers end: the most extreme values that are not outliers. */
    whiskerLow: number;
    whiskerHigh: number;
    /** The values beyond the whiskers. */
    outliers: number[];
    /** The lowest and the highest value the mark reaches, outliers included: what the axis has to hold. */
    lowest: number;
    highest: number;
}

const medianOf = (sorted: readonly number[]): number => {
    const n = sorted.length;

    if (!n) return NaN;

    return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
};

/** The first quartile, the median and the third quartile of values in ascending order. */
export function quartiles(sorted: readonly number[], method: QuartileMethod = 'exclusive'): [number, number, number] {
    const n = sorted.length;

    if (!n) return [NaN, NaN, NaN];
    if (n === 1) return [sorted[0], sorted[0], sorted[0]];

    if (method === 'linear') {
        const at = (p: number) => {
            const rank = (n - 1) * p;
            const lo = Math.floor(rank);
            const hi = Math.ceil(rank);

            return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
        };

        return [at(0.25), at(0.5), at(0.75)];
    }

    const half = Math.floor(n / 2);
    const lower = sorted.slice(0, half + (n % 2 && method === 'inclusive' ? 1 : 0));
    const upper = sorted.slice(n - half - (n % 2 && method === 'inclusive' ? 1 : 0));

    return [medianOf(lower), medianOf(sorted), medianOf(upper)];
}

/** The statistics of some values. Values that are not finite numbers are ignored; `null` when none are left. */
export function boxStatsFromValues(values: readonly unknown[], method: QuartileMethod = 'exclusive', whiskerReach = 1.5): BoxStats | null {
    const sorted = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);

    if (!sorted.length) return null;

    const [q1, median, q3] = quartiles(sorted, method);
    const iqr = q3 - q1;
    const fenceLow = q1 - whiskerReach * iqr;
    const fenceHigh = q3 + whiskerReach * iqr;
    const inside = sorted.filter((v) => v >= fenceLow && v <= fenceHigh);
    const outliers = sorted.filter((v) => v < fenceLow || v > fenceHigh);

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        q1,
        median,
        q3,
        mean: sorted.reduce((s, v) => s + v, 0) / sorted.length,
        whiskerLow: inside.length ? inside[0] : q1,
        whiskerHigh: inside.length ? inside[inside.length - 1] : q3,
        outliers,
        lowest: sorted[0],
        highest: sorted[sorted.length - 1]
    };
}

/** The fields of a series that say where a box plot's numbers are. */
export interface BoxFields {
    /** A field holding the raw values of the category as an array. */
    valuesField?: string;
    minField?: string;
    q1Field?: string;
    medianField?: string;
    q3Field?: string;
    maxField?: string;
    meanField?: string;
    /** A field holding the outliers as an array. */
    outliersField?: string;
    quartileMethod?: QuartileMethod;
    /** How far the whiskers reach, in interquartile ranges. Default 1.5. */
    whiskerReach?: number;
}

const read = (datum: unknown, field: string | undefined): unknown => {
    if (!field || datum === null || typeof datum !== 'object') return undefined;

    return field.split('.').reduce<any>((v, key) => (v == null ? undefined : v[key]), datum);
};

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * The statistics of one datum: computed from its raw values when `valuesField` names an array, read from the five fields otherwise.
 * `null` when the datum does not say enough.
 */
export function readBoxStats(datum: unknown, f: BoxFields): BoxStats | null {
    const raw = read(datum, f.valuesField ?? 'values');

    if (Array.isArray(raw)) return boxStatsFromValues(raw, f.quartileMethod, f.whiskerReach);

    const min = num(read(datum, f.minField ?? 'min'));
    const q1 = num(read(datum, f.q1Field ?? 'q1'));
    const median = num(read(datum, f.medianField ?? 'median'));
    const q3 = num(read(datum, f.q3Field ?? 'q3'));
    const max = num(read(datum, f.maxField ?? 'max'));

    if (min === null || q1 === null || median === null || q3 === null || max === null) return null;

    const outliers = (Array.isArray(read(datum, f.outliersField ?? 'outliers')) ? (read(datum, f.outliersField ?? 'outliers') as unknown[]) : []).map(num).filter((v): v is number => v !== null);
    const mean = num(read(datum, f.meanField ?? 'mean'));

    return {
        min,
        max,
        q1,
        median,
        q3,
        mean: mean ?? undefined,
        whiskerLow: min,
        whiskerHigh: max,
        outliers,
        lowest: Math.min(min, ...outliers),
        highest: Math.max(max, ...outliers)
    };
}
