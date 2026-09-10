export type Row = {
    market: string;
    type: 'BEV' | 'PHEV';
    sliceId: string;
    units: number;
};

export const YEAR_DATA: Record<string, Row[]> = {
    '2016': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 0.25 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 0.1 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 0.12 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.1 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.11 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.05 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.03 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.01 }
    ],
    '2017': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 0.37 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 0.21 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 0.15 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.16 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.13 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.07 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.09 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.04 }
    ],
    '2018': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 0.79 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 0.31 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 0.18 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.22 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.25 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.11 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.11 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.04 }
    ],
    '2019': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 0.83 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 0.23 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 0.23 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.33 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.24 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.09 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.19 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.07 }
    ],
    '2020': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 0.82 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 0.38 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 0.73 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.67 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.25 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.08 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.22 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.09 }
    ],
    '2021': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 2.76 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 1.04 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 1.08 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.72 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.51 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.14 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.35 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.15 }
    ],
    '2022': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 4.79 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 2.01 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 1.39 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.71 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.8 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.15 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.44 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.23 }
    ],
    '2023': [
        { market: 'China', type: 'BEV', sliceId: 'CN-BEV', units: 8.1 },
        { market: 'China', type: 'PHEV', sliceId: 'CN-PHEV', units: 2.4 },
        { market: 'Europe', type: 'BEV', sliceId: 'EU-BEV', units: 1.5 },
        { market: 'Europe', type: 'PHEV', sliceId: 'EU-PHEV', units: 0.8 },
        { market: 'United States', type: 'BEV', sliceId: 'US-BEV', units: 0.9 },
        { market: 'United States', type: 'PHEV', sliceId: 'US-PHEV', units: 0.2 },
        { market: 'Rest of World', type: 'BEV', sliceId: 'RW-BEV', units: 0.47 },
        { market: 'Rest of World', type: 'PHEV', sliceId: 'RW-PHEV', units: 0.28 }
    ]
};
