export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

function generateSeries(): Candle[] {
    const anchors: { month: number; day: number; close: number }[] = [
        { month: 0, day: 2, close: 185.64 },
        { month: 0, day: 31, close: 184.4 },
        { month: 1, day: 29, close: 180.75 },
        { month: 2, day: 28, close: 171.48 },
        { month: 3, day: 30, close: 170.33 },
        { month: 4, day: 31, close: 192.25 },
        { month: 5, day: 28, close: 210.62 },
        { month: 6, day: 31, close: 222.08 },
        { month: 7, day: 30, close: 229.0 },
        { month: 8, day: 30, close: 233.0 },
        { month: 9, day: 31, close: 225.91 },
        { month: 10, day: 29, close: 237.33 },
        { month: 11, day: 31, close: 250.42 }
    ];

    const days: { ts: number; close: number }[] = [];
    const year = 2024;

    for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i];
        const b = anchors[i + 1];

        if (!a || !b) continue;

        const aDate = Date.UTC(year, a.month, a.day);
        const bDate = Date.UTC(year, b.month, b.day);
        const span = Math.round((bDate - aDate) / 86_400_000);

        for (let d = 0; d < span; d++) {
            const t = aDate + d * 86_400_000;
            const wd = new Date(t).getUTCDay();

            if (wd === 0 || wd === 6) continue;

            const progress = d / span;
            const base = a.close + (b.close - a.close) * progress;
            const jitter = (Math.sin(t / 1e6) * 0.4 + Math.cos(t / 7e5) * 0.6) * (base * 0.012);

            days.push({ ts: t, close: +(base + jitter).toFixed(2) });
        }
    }

    const candles: Candle[] = [];
    const firstDay = days[0];

    if (!firstDay) return candles;

    let prevClose = firstDay.close;

    for (const d of days) {
        const open = prevClose;
        const close = d.close;
        const range = Math.abs(close - open) + Math.abs(Math.sin(d.ts / 2e5)) * (close * 0.008);
        const high = +(Math.max(open, close) + range * 0.4).toFixed(2);
        const low = +(Math.min(open, close) - range * 0.4).toFixed(2);

        candles.push({ ts: d.ts, open: +open.toFixed(2), high, low, close });
        prevClose = close;
    }

    return candles;
}

export const aaplDaily: Candle[] = generateSeries();
