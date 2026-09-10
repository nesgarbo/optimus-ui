export const COHORTS = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024'] as const;

const MONTHS_SINCE = Array.from({ length: 12 }, (_, i) => `M${i}`);

export const sizes: Record<(typeof COHORTS)[number], number> = {
    'Jan 2024': 450,
    'Feb 2024': 480,
    'Mar 2024': 520,
    'Apr 2024': 580,
    'May 2024': 640,
    'Jun 2024': 700,
    'Jul 2024': 760,
    'Aug 2024': 820,
    'Sep 2024': 890,
    'Oct 2024': 960,
    'Nov 2024': 1040,
    'Dec 2024': 1100
};

export const retention: Record<(typeof COHORTS)[number], (number | null)[]> = {
    'Jan 2024': [100, 72, 58, 51, 46, 42, 40, 38, 37, 36, 35, 34],
    'Feb 2024': [100, 70, 56, 49, 44, 40, 38, 36, 35, 34, 33, null],
    'Mar 2024': [100, 75, 61, 54, 49, 45, 43, 41, 40, 39, null, null],
    'Apr 2024': [100, 73, 58, 52, 47, 43, 41, 39, 38, null, null, null],
    'May 2024': [100, 76, 63, 57, 52, 48, 46, 44, null, null, null, null],
    'Jun 2024': [100, 74, 60, 54, 49, 45, 43, null, null, null, null, null],
    'Jul 2024': [100, 78, 66, 60, 55, 51, null, null, null, null, null, null],
    'Aug 2024': [100, 80, 68, 62, 57, null, null, null, null, null, null, null],
    'Sep 2024': [100, 79, 67, 61, null, null, null, null, null, null, null, null],
    'Oct 2024': [100, 82, 70, null, null, null, null, null, null, null, null, null],
    'Nov 2024': [100, 83, null, null, null, null, null, null, null, null, null, null],
    'Dec 2024': [100, null, null, null, null, null, null, null, null, null, null, null]
};

interface Cell {
    cohort: string;
    monthsSince: string;
    pct: number | null;
}

export const saasRetention: Cell[] = [];

for (const cohort of COHORTS) {
    retention[cohort].forEach((pct, i) => {
        saasRetention.push({ cohort, monthsSince: MONTHS_SINCE[i], pct });
    });
}
