export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

const WEEKLY: [string, number][] = [
    ['2024-01-05', 73.81],
    ['2024-01-12', 72.68],
    ['2024-01-19', 73.25],
    ['2024-01-26', 78.01],
    ['2024-02-02', 72.28],
    ['2024-02-09', 76.84],
    ['2024-02-16', 79.19],
    ['2024-02-23', 76.49],
    ['2024-03-01', 79.97],
    ['2024-03-08', 77.01],
    ['2024-03-15', 81.04],
    ['2024-03-22', 80.63],
    ['2024-03-29', 83.17],
    ['2024-04-05', 86.91],
    ['2024-04-12', 85.66],
    ['2024-04-19', 83.14],
    ['2024-04-26', 83.85],
    ['2024-05-03', 78.11],
    ['2024-05-10', 78.26],
    ['2024-05-17', 80.06],
    ['2024-05-24', 77.72],
    ['2024-05-31', 76.99],
    ['2024-06-07', 75.53],
    ['2024-06-14', 78.45],
    ['2024-06-21', 80.73],
    ['2024-06-28', 81.54],
    ['2024-07-05', 83.16],
    ['2024-07-12', 82.21],
    ['2024-07-19', 80.13],
    ['2024-07-26', 77.16],
    ['2024-08-02', 73.52],
    ['2024-08-09', 76.84],
    ['2024-08-16', 74.83],
    ['2024-08-23', 74.83],
    ['2024-08-30', 73.55],
    ['2024-09-06', 67.67],
    ['2024-09-13', 68.65],
    ['2024-09-20', 71.0],
    ['2024-09-27', 68.18],
    ['2024-10-04', 74.38],
    ['2024-10-11', 75.56],
    ['2024-10-18', 69.22],
    ['2024-10-25', 71.78],
    ['2024-11-01', 69.49],
    ['2024-11-08', 70.38],
    ['2024-11-15', 67.02],
    ['2024-11-22', 71.24],
    ['2024-11-29', 68.0],
    ['2024-12-06', 67.2],
    ['2024-12-13', 71.29],
    ['2024-12-20', 69.46],
    ['2024-12-27', 70.6]
];

let rngState = 314;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function buildCandles(): Candle[] {
    const candles: Candle[] = [];
    const firstEntry = WEEKLY[0];

    if (!firstEntry) return candles;

    let prevClose = firstEntry[1];

    for (const [iso, close] of WEEKLY) {
        const ts = Date.parse(iso);
        const open = prevClose;
        const range = Math.abs(close - open) * 1.5 + 1.2 + seededRandom() * 1.6;
        const mid = (open + close) / 2;
        const high = +Math.max(open, close, mid + range / 2).toFixed(2);
        const low = +Math.min(open, close, mid - range / 2).toFixed(2);

        candles.push({ ts, open, high, low, close });
        prevClose = close;
    }

    return candles;
}

export const crudeOil: Candle[] = buildCandles();
