export interface Point {
    t: number;
    speed: number;
    fuel: number;
    engine: number;
    battery: number;
}

function generate(seed: number, n: number): Point[] {
    let s = seed;

    const rand = () => {
        s = (s * 9301 + 49297) % 233280;

        return s / 233280;
    };

    const result: Point[] = [];

    for (let i = 0; i < n; i++) {
        const trend = Math.sin(i / 12 + seed) * 10;

        result.push({
            t: i,
            speed: Math.max(0, 55 + trend + (rand() - 0.5) * 6),
            fuel: Math.max(10, 72 - i * 0.25 + (rand() - 0.5) * 2),
            engine: 88 + Math.cos(i / 8) * 3 + (rand() - 0.5) * 2,
            battery: Math.max(60, 95 - i * 0.1 + (rand() - 0.5) * 1.5)
        });
    }

    return result;
}

export const vans = [
    { id: 'V-101', label: 'Van 101 · A', data: generate(1, 60) },
    { id: 'V-203', label: 'Van 203 · B', data: generate(4, 60) },
    { id: 'V-318', label: 'Van 318 · C', data: generate(7, 60) },
    { id: 'V-412', label: 'Van 412 · D', data: generate(11, 60) }
];
