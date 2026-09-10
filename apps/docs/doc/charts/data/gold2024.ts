export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

const WEEKLY_CLOSES: [string, number][] = [
    ['2024-01-05', 2050],
    ['2024-01-12', 2051],
    ['2024-01-19', 2029],
    ['2024-01-26', 2019],
    ['2024-02-02', 2039],
    ['2024-02-09', 2024],
    ['2024-02-16', 2013],
    ['2024-02-23', 2035],
    ['2024-03-01', 2082],
    ['2024-03-08', 2179],
    ['2024-03-15', 2156],
    ['2024-03-22', 2165],
    ['2024-03-29', 2232],
    ['2024-04-05', 2329],
    ['2024-04-12', 2343],
    ['2024-04-19', 2391],
    ['2024-04-26', 2337],
    ['2024-05-03', 2301],
    ['2024-05-10', 2360],
    ['2024-05-17', 2414],
    ['2024-05-24', 2333],
    ['2024-05-31', 2327],
    ['2024-06-07', 2292],
    ['2024-06-14', 2330],
    ['2024-06-21', 2322],
    ['2024-06-28', 2326],
    ['2024-07-05', 2391],
    ['2024-07-12', 2411],
    ['2024-07-19', 2401],
    ['2024-07-26', 2386],
    ['2024-08-02', 2443],
    ['2024-08-09', 2430],
    ['2024-08-16', 2508],
    ['2024-08-23', 2512],
    ['2024-08-30', 2502],
    ['2024-09-06', 2497],
    ['2024-09-13', 2577],
    ['2024-09-20', 2621],
    ['2024-09-27', 2658],
    ['2024-10-04', 2652],
    ['2024-10-11', 2656],
    ['2024-10-18', 2721],
    ['2024-10-25', 2747],
    ['2024-11-01', 2736],
    ['2024-11-08', 2684],
    ['2024-11-15', 2563],
    ['2024-11-22', 2711],
    ['2024-11-29', 2650],
    ['2024-12-06', 2632],
    ['2024-12-13', 2648],
    ['2024-12-20', 2620],
    ['2024-12-27', 2636]
];

let rngState = 1618;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generateWeekly(): Candle[] {
    const points = WEEKLY_CLOSES.map(([iso, close]) => ({
        ts: Date.parse(iso),
        close
    }));
    const candles: Candle[] = [];
    const firstPoint = points[0];

    if (!firstPoint) return candles;

    let prevClose = firstPoint.close;

    for (const p of points) {
        const open = prevClose;
        const close = p.close;
        const range = Math.abs(close - open) * 1.4 + 22 + seededRandom() * 30;
        const mid = (open + close) / 2;
        const high = +Math.max(open, close, mid + range / 2).toFixed(2);
        const low = +Math.min(open, close, mid - range / 2).toFixed(2);

        candles.push({ ts: p.ts, open, high, low, close });
        prevClose = close;
    }

    return candles;
}

export const gold2024: Candle[] = generateWeekly();
