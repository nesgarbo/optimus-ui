/**
 * Turning a list of numbers into the bins of a histogram.
 *
 * The result feeds a `ChartBar` as it is: `label` is the category, `count` or `density` the value. Set
 * `categoryGap` to 0 on the bar to make the bins touch, which is what tells a histogram from a bar chart.
 *
 * @module histogram
 */

/** How the number of bins is chosen when `bins` is not given. */
export type HistogramRule = 'sturges' | 'sqrt' | 'scott' | 'freedman-diaconis';

/** Options of {@link histogram}. */
export interface HistogramOptions {
    /** A fixed number of equal bins. Wins over `rule`. */
    bins?: number;
    /** How many bins to use when `bins` is not given. Default `sturges`. */
    rule?: HistogramRule;
    /** The edges between bins, inside the domain. The bins are then the gaps between them and may differ in width. Wins over `bins` and `rule`. */
    thresholds?: number[];
    /** The range the bins cover. Default: from the least value to the greatest. Values outside it are left out. */
    domain?: [number, number];
    /** Makes the edges round numbers, widening the domain to fit them. Ignored when `thresholds` or `domain` is given. */
    nice?: boolean;
    /** Writes the label of a bin from its edges. */
    label?: (x0: number, x1: number) => string;
}

/** One bin. */
export interface HistogramBin {
    /** The lower edge, included. */
    x0: number;
    /** The upper edge, excluded, except for the last bin, which includes it. */
    x1: number;
    /** How many values fall in it. */
    count: number;
    /** The share of all the values per unit of width: bins of different widths compare fairly, and the areas add up to 1. */
    density: number;
    /** The text of the bin, `x0–x1` unless `label` says otherwise. */
    label: string;
}

const MAX_BINS = 200;

function quantile(sorted: number[], q: number): number {
    if (!sorted.length) return NaN;

    const pos = (sorted.length - 1) * q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);

    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** The number of bins a rule picks for sorted values. */
export function binCount(sorted: number[], rule: HistogramRule = 'sturges'): number {
    const n = sorted.length;

    if (n < 2) return 1;

    const span = sorted[n - 1] - sorted[0];

    if (span === 0) return 1;

    let count: number;

    switch (rule) {
        case 'sqrt':
            count = Math.ceil(Math.sqrt(n));
            break;
        case 'scott':
        case 'freedman-diaconis': {
            let width: number;

            if (rule === 'scott') {
                const mean = sorted.reduce((s, v) => s + v, 0) / n;
                const sd = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1));

                width = (3.49 * sd) / Math.cbrt(n);
            } else {
                width = (2 * (quantile(sorted, 0.75) - quantile(sorted, 0.25))) / Math.cbrt(n);
            }

            count = width > 0 ? Math.ceil(span / width) : Math.ceil(Math.log2(n) + 1);
            break;
        }
        default:
            count = Math.ceil(Math.log2(n) + 1);
    }

    return Math.min(Math.max(count, 1), MAX_BINS);
}

const trim = (n: number) => String(Number(n.toPrecision(12)));

function niceEdges(min: number, max: number, count: number): [number, number, number] {
    const raw = (max - min) / Math.max(count, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / pow;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;

    return [Number(lo.toPrecision(12)), Number(hi.toPrecision(12)), Math.max(Math.round((hi - lo) / step), 1)];
}

/** Counts `values` into bins. Values that are not finite numbers are ignored. */
export function histogram(values: readonly unknown[], options: HistogramOptions = {}): HistogramBin[] {
    const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);

    if (!nums.length) return [];

    let [lo, hi] = options.domain ?? [nums[0], nums[nums.length - 1]];
    let edges: number[];

    if (options.thresholds?.length) {
        edges = [lo, ...options.thresholds.filter((t) => t > lo && t < hi).sort((a, b) => a - b), hi];
    } else {
        let count = options.bins && options.bins > 0 ? Math.min(Math.floor(options.bins), MAX_BINS) : binCount(nums, options.rule);

        if (options.nice && !options.domain) [lo, hi, count] = niceEdges(lo, hi, count);

        // Every value equal: one bin, with a width, so the density is defined.
        if (hi === lo) {
            lo -= 0.5;
            hi += 0.5;
            count = 1;
        }

        const width = (hi - lo) / count;

        edges = Array.from({ length: count + 1 }, (_, i) => (i === count ? hi : Number((lo + i * width).toPrecision(12))));
    }

    const inDomain = nums.filter((v) => v >= edges[0] && v <= edges[edges.length - 1]);
    const label = options.label ?? ((a: number, b: number) => `${trim(a)}–${trim(b)}`);
    const counts = new Array<number>(edges.length - 1).fill(0);

    for (const v of inDomain) {
        // Binary search for the last edge at or below v; the top edge belongs to the last bin.
        let a = 0;
        let b = counts.length - 1;

        while (a < b) {
            const mid = (a + b + 1) >> 1;

            if (edges[mid] <= v) a = mid;
            else b = mid - 1;
        }

        counts[a]++;
    }

    const total = inDomain.length || 1;

    return counts.map((count, i) => ({ x0: edges[i], x1: edges[i + 1], count, density: count / total / (edges[i + 1] - edges[i]), label: label(edges[i], edges[i + 1]) }));
}
