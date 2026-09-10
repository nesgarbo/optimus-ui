import { syncedCandlestickVolume as candles, type Candle } from '@/doc/charts/data/syncedCandlestickVolume';

export interface FinancialWorkstationPoint extends Candle {
    vwap: number;
    spread: number;
    spreadBps: number;
    depth: number;
    orderImbalance: number;
    spreadColor: string;
    depthColor: string;
}

export interface AverageLinePoint {
    date: string;
    value: number;
}

export const syncedFinancialWorkstation: FinancialWorkstationPoint[] = candles.map((candle, index) => {
    const prev = candles[index - 1];
    const move = prev ? Math.abs(candle.close - prev.close) : Math.abs(candle.close - candle.open);
    const intradayRange = Math.max(candle.high - candle.low, 1);
    const eventPressure = candle.volume > 82 ? 5.4 : candle.volume > 62 ? 2.6 : 0;
    const spreadBps = +(7.5 + move * 0.5 + eventPressure + (index % 4) * 0.65).toFixed(1);
    const spread = +((candle.close * spreadBps) / 10000).toFixed(2);
    const depth = +(96 - spreadBps * 2.15 + ((index * 11) % 13) * 1.35).toFixed(1);
    const orderImbalance = +(((candle.close - candle.open) / intradayRange) * 100).toFixed(1);
    const vwap = +((candle.high + candle.low + candle.close * 2) / 4).toFixed(2);

    return {
        ...candle,
        vwap,
        spread,
        spreadBps,
        depth,
        orderImbalance,
        spreadColor: spreadBps >= 18 ? '#ff7a66' : spreadBps >= 13 ? '#ffad5a' : '#4ecdc4',
        depthColor: depth < 60 ? '#ffad5a' : '#5ccf9f'
    };
});

export function movingAverage(field: 'close' | 'vwap' | 'spreadBps', windowSize: number): AverageLinePoint[] {
    return syncedFinancialWorkstation
        .map((point, index) => {
            if (index < windowSize - 1) return null;

            const window = syncedFinancialWorkstation.slice(index - windowSize + 1, index + 1);
            const value = window.reduce((sum, row) => sum + row[field], 0) / window.length;

            return { date: point.date, value: +value.toFixed(field === 'spreadBps' ? 1 : 2) };
        })
        .filter((point): point is AverageLinePoint => point !== null);
}

export const financialWorkstationSummary = {
    lastClose: syncedFinancialWorkstation[syncedFinancialWorkstation.length - 1]?.close ?? 0,
    lastSpreadBps: syncedFinancialWorkstation[syncedFinancialWorkstation.length - 1]?.spreadBps ?? 0,
    averageVolume: +(syncedFinancialWorkstation.reduce((sum, row) => sum + row.volume, 0) / syncedFinancialWorkstation.length).toFixed(1),
    averageSpreadBps: +(syncedFinancialWorkstation.reduce((sum, row) => sum + row.spreadBps, 0) / syncedFinancialWorkstation.length).toFixed(1),
    lowDepth: Math.min(...syncedFinancialWorkstation.map((row) => row.depth))
};
