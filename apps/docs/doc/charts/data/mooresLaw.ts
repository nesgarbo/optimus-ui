export interface Chip {
    year: number;
    name: string;
    count: number;
}

export const chips: Chip[] = [
    { year: 1971, name: 'Intel 4004', count: 2_300 },
    { year: 1974, name: 'Intel 8080', count: 4_500 },
    { year: 1978, name: 'Intel 8086', count: 29_000 },
    { year: 1982, name: 'Intel 80286', count: 134_000 },
    { year: 1985, name: 'Intel 80386', count: 275_000 },
    { year: 1989, name: 'Intel 80486', count: 1_180_235 },
    { year: 1993, name: 'Intel Pentium', count: 3_100_000 },
    { year: 1997, name: 'Pentium II', count: 7_500_000 },
    { year: 1999, name: 'Pentium III', count: 9_500_000 },
    { year: 2000, name: 'Pentium 4', count: 42_000_000 },
    { year: 2003, name: 'Itanium 2', count: 220_000_000 },
    { year: 2006, name: 'Intel Core 2 Duo', count: 291_000_000 },
    { year: 2008, name: 'Intel Nehalem-EX', count: 2_300_000_000 },
    { year: 2012, name: 'IBM POWER7+', count: 2_100_000_000 },
    { year: 2014, name: 'IBM POWER8', count: 4_200_000_000 },
    { year: 2015, name: 'Oracle SPARC M7', count: 10_000_000_000 },
    { year: 2017, name: 'AMD Epyc', count: 19_200_000_000 },
    { year: 2019, name: 'AMD Epyc Rome', count: 39_540_000_000 },
    { year: 2020, name: 'NVIDIA A100', count: 54_200_000_000 },
    { year: 2022, name: 'NVIDIA H100', count: 80_000_000_000 },
    { year: 2022, name: 'Apple M1 Ultra', count: 114_000_000_000 },
    { year: 2023, name: 'AMD MI300X', count: 153_000_000_000 },
    { year: 2024, name: 'NVIDIA B200', count: 208_000_000_000 }
];

export const BASELINE_YEAR = 1971;
export const BASELINE_COUNT = 2_300;
export const projectMoore = (year: number) => BASELINE_COUNT * Math.pow(2, (year - BASELINE_YEAR) / 2);

export type Spot = {
    year: number;
    count: number;
    label: string;
    place?: 'left' | 'right';
};

export const spotlights: Spot[] = [
    { year: 1971, count: 2_300, label: 'Intel 4004 — the origin' },
    { year: 1989, count: 1_180_235, label: '1M barrier · Intel 80486' },
    { year: 2008, count: 2_300_000_000, label: '1B barrier · Nehalem-EX' },
    { year: 2022, count: 114_000_000_000, label: 'Apple M1 Ultra · 114B', place: 'left' },
    { year: 2024, count: 208_000_000_000, label: 'NVIDIA B200 · 208B', place: 'right' }
];
