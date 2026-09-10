export interface AnomalyPoint {
    ts: number;
    v: number;
}

function seededRandom(seed: number): number {
    let t = seed + 0x6d2b79f5;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const temperatureAnomaly: AnomalyPoint[] = [];

for (let year = 1940; year <= 2024; year++) {
    for (let m = 0; m < 12; m++) {
        const t = year - 1940 + m / 12;
        const trend = t < 35 ? -0.05 + t * 0.003 : -0.05 + 35 * 0.003 + (t - 35) * 0.022;
        const seasonal = 0.12 * Math.sin(((m - 1) * Math.PI) / 6);
        const noise = (seededRandom(year * 13 + m * 7) - 0.5) * 0.28;
        const nino = year === 1998 && m >= 1 && m <= 5 ? 0.25 : year === 2016 && m >= 0 && m <= 4 ? 0.22 : year === 2024 && m >= 0 && m <= 6 ? 0.18 : year === 1983 && m >= 2 && m <= 6 ? 0.15 : 0;
        const v = Math.round((trend + seasonal + noise + nino) * 100) / 100;

        temperatureAnomaly.push({ ts: new Date(year, m, 1).getTime(), v });
    }
}
