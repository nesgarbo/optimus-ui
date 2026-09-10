export interface Candle {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    barColor: string;
}

const ANCHORS: [string, number][] = [
    ['2024-01-02', 495],
    ['2024-01-12', 547],
    ['2024-01-19', 595],
    ['2024-01-26', 612],
    ['2024-02-02', 638],
    ['2024-02-09', 672],
    ['2024-02-16', 726],
    ['2024-02-21', 788],
    ['2024-02-28', 823],
    ['2024-03-07', 875],
    ['2024-03-14', 919],
    ['2024-03-21', 879],
    ['2024-03-28', 903]
];

let rngState = 2019;

function seededRandom() {
    let t = (rngState += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const EARNINGS_DATE = '2024-02-21';

function generateDaily(): Candle[] {
    const points = ANCHORS.map(([iso, close]) => ({
        ts: Date.parse(iso),
        close
    }));
    const daily: { ts: number; date: string; close: number }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        if (!a || !b) continue;

        const span = Math.round((b.ts - a.ts) / 86_400_000);

        for (let d = 0; d < span; d++) {
            const t = a.ts + d * 86_400_000;
            const wd = new Date(t).getUTCDay();

            if (wd === 0 || wd === 6) continue;

            const progress = d / span;
            const base = a.close + (b.close - a.close) * progress;
            const jitter = (seededRandom() - 0.5) * base * 0.014;

            daily.push({
                ts: t,
                date: new Date(t).toISOString().slice(0, 10),
                close: +(base + jitter).toFixed(2)
            });
        }
    }

    const raw: Omit<Candle, 'barColor'>[] = [];
    const firstDay = daily[0];

    if (!firstDay) return [];

    let prevClose = firstDay.close;

    for (const d of daily) {
        const open = prevClose;
        const close = d.close;
        const isEarnings = d.date === EARNINGS_DATE;
        const range = Math.abs(close - open) * 1.5 + close * (isEarnings ? 0.022 : 0.007) + seededRandom() * 6;
        const high = +(Math.max(open, close) + range * 0.55).toFixed(2);
        const low = +(Math.min(open, close) - range * 0.45).toFixed(2);
        const volume = +(38 + seededRandom() * 22 + (isEarnings ? 55 : 0)).toFixed(1);

        raw.push({
            date: d.date,
            open: +open.toFixed(2),
            high,
            low,
            close,
            volume
        });
        prevClose = close;
    }

    return raw.map((d, i) => {
        const prev = raw[i - 1];

        return {
            ...d,
            barColor: !prev || d.close >= prev.close ? '#22c55e' : '#ef4444'
        };
    });
}

export const syncedCandlestickVolume: Candle[] = generateDaily();
