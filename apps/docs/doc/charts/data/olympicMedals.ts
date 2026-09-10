const SPORTS = ['Swimming', 'Athletics', 'Gymnastics', 'Cycling', 'Judo', 'Rowing', 'Shooting', 'Climbing', 'Fencing', 'Sailing'] as const;

const COUNTRIES = [
    { code: 'USA', name: 'United States' },
    { code: 'CHN', name: 'China' },
    { code: 'GBR', name: 'Great Britain' },
    { code: 'FRA', name: 'France' },
    { code: 'AUS', name: 'Australia' },
    { code: 'JPN', name: 'Japan' },
    { code: 'GER', name: 'Germany' },
    { code: 'NED', name: 'Netherlands' },
    { code: 'KOR', name: 'South Korea' },
    { code: 'ITA', name: 'Italy' }
] as const;

type Podium = [number, number, number] | null;

const MEDALS: Record<string, Podium[]> = {
    USA: [[8, 6, 4], [6, 5, 3], [2, 2, 1], [0, 1, 1], null, [1, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1], null],
    CHN: [
        [2, 3, 4],
        [2, 1, 1],
        [1, 2, 2],
        [1, 0, 0],
        [0, 1, 0],
        [1, 0, 1],
        [5, 2, 3],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
    ],
    GBR: [[1, 2, 2], [1, 1, 2], [0, 1, 1], [3, 3, 2], [0, 0, 1], [3, 2, 1], null, [1, 0, 0], null, [1, 1, 0]],
    FRA: [
        [2, 1, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [3, 2, 2],
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
        [2, 1, 1],
        [1, 0, 1]
    ],
    AUS: [[7, 5, 4], [1, 1, 0], null, [1, 0, 1], null, [1, 1, 0], [0, 1, 0], [0, 0, 1], null, [3, 1, 0]],
    JPN: [[1, 1, 1], [0, 1, 1], [2, 1, 1], null, [3, 2, 3], null, [0, 1, 0], [1, 1, 0], [2, 1, 2], null],
    GER: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 2], [0, 1, 1], [1, 1, 0], [1, 0, 1], null, [0, 1, 1], [1, 0, 1]],
    NED: [[1, 1, 1], [1, 1, 0], null, [4, 3, 1], [1, 0, 2], [2, 1, 1], null, [0, 1, 0], null, [1, 1, 0]],
    KOR: [null, null, [0, 0, 1], null, [1, 1, 2], null, [3, 2, 1], [0, 0, 1], [2, 1, 1], null],
    ITA: [[1, 2, 2], [1, 0, 1], [0, 1, 1], [1, 1, 1], [0, 1, 1], [0, 1, 1], [1, 1, 0], null, [2, 2, 1], [1, 0, 0]]
};

export interface Cell {
    country: string;
    countryName: string;
    sport: string;
    total: number | null;
    gold: number;
    silver: number;
    bronze: number;
}

export const olympicMedals: Cell[] = [];

for (const { code, name } of COUNTRIES) {
    MEDALS[code].forEach((podium, i) => {
        const [gold, silver, bronze] = podium ?? [0, 0, 0];

        olympicMedals.push({
            country: code,
            countryName: name,
            sport: SPORTS[i],
            total: podium ? gold + silver + bronze : null,
            gold,
            silver,
            bronze
        });
    });
}
