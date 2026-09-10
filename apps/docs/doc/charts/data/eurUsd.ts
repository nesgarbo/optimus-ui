export interface Candle {
    ts: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

function generateDaily(): Candle[] {
    const anchors: [string, number][] = [
        ['2024-07-01', 1.074],
        ['2024-07-15', 1.09],
        ['2024-07-29', 1.082],
        ['2024-08-05', 1.091],
        ['2024-08-19', 1.108],
        ['2024-09-02', 1.104],
        ['2024-09-16', 1.11],
        ['2024-09-30', 1.113],
        ['2024-10-07', 1.097],
        ['2024-10-21', 1.081],
        ['2024-11-04', 1.088],
        ['2024-11-18', 1.058],
        ['2024-12-02', 1.05],
        ['2024-12-16', 1.049],
        ['2024-12-27', 1.042]
    ];
    const points = anchors.map(([iso, close]) => ({
        ts: Date.parse(iso),
        close
    }));
    const candles: Candle[] = [];
    const daily: { ts: number; close: number }[] = [];

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
            const jitter = (Math.sin(t / 4e5) * 0.4 + Math.cos(t / 9e5) * 0.6) * 0.0045;

            daily.push({ ts: t, close: +(base + jitter).toFixed(5) });
        }
    }

    const firstDaily = daily[0];

    if (!firstDaily) return candles;

    let prevClose = firstDaily.close;

    for (const d of daily) {
        const open = prevClose;
        const close = d.close;
        const range = Math.abs(close - open) + 0.001 + Math.abs(Math.sin(d.ts / 1e5)) * 0.003;
        const high = +(Math.max(open, close) + range * 0.5).toFixed(5);
        const low = +(Math.min(open, close) - range * 0.5).toFixed(5);

        candles.push({ ts: d.ts, open: +open.toFixed(5), high, low, close });
        prevClose = close;
    }

    return candles;
}

export const eurUsd: Candle[] = generateDaily();
