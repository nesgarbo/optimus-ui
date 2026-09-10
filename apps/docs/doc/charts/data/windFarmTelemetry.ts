export interface Reading {
    speed: number;
    power: number;
}

export const TELEMETRY_COUNT = 100000;
export const TELEMETRY_SEED = 42;

function seededRandom(seed: number) {
    let s = seed >>> 0;

    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;

        return s / 0xffffffff;
    };
}

export function generateReadings(n: number, seed: number): Reading[] {
    const rng = seededRandom(seed);
    const out: Reading[] = new Array(n);

    for (let i = 0; i < n; i++) {
        const u = rng();
        const speed = Math.min(25, Math.max(0, -8 * Math.log(1 - u)));
        let power: number;

        if (speed < 3) power = 0;
        else if (speed < 12) power = 2200 * Math.pow((speed - 3) / 9, 2.1);
        else if (speed < 22) power = 2200 + (rng() - 0.5) * 50;
        else power = 0;

        const noise = (rng() - 0.5) * 120;

        out[i] = { speed: speed + (rng() - 0.5) * 0.4, power: Math.max(0, power + noise) };
    }

    return out;
}
