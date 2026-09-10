export interface Point {
    t: string;
    cpu: number;
    memory: number;
    network: number;
    disk: number;
}

function generate(): Point[] {
    const result: Point[] = [];

    for (let i = 0; i < 144; i++) {
        const h = Math.floor(i / 6);
        const mm = (i % 6) * 10;
        const label = `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
        const businessHours = h >= 9 && h < 18;
        const peakMultiplier = businessHours ? 1 : 0.45;
        const noise = () => (Math.sin(i * 1.37) + Math.sin(i * 0.71)) * 0.5;

        const cpu = Math.max(5, 40 * peakMultiplier + 25 * Math.sin(i / 12) + noise() * 8);
        const memory = Math.max(30, 55 + 15 * Math.sin(i / 18) + noise() * 3);
        const network = Math.max(0, 60 * peakMultiplier + 20 * Math.sin(i / 9) + noise() * 15);
        const disk = Math.max(0, 20 * peakMultiplier + 10 * Math.cos(i / 11) + noise() * 6);

        result.push({
            t: label,
            cpu: +cpu.toFixed(1),
            memory: +memory.toFixed(1),
            network: +network.toFixed(1),
            disk: +disk.toFixed(1)
        });
    }

    return result;
}

export const syncedServerMetrics: Point[] = generate();
