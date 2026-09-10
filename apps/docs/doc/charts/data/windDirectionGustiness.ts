export interface WindGustRow {
    direction: string;
    sustained: number;
    gust: number;
}

export const windDirectionGustiness: WindGustRow[] = [
    { direction: 'N', sustained: 12, gust: 18 },
    { direction: 'NE', sustained: 8, gust: 10 },
    { direction: 'E', sustained: 15, gust: 12 },
    { direction: 'SE', sustained: 22, gust: 8 },
    { direction: 'S', sustained: 20, gust: 6 },
    { direction: 'SW', sustained: 8, gust: 22 },
    { direction: 'W', sustained: 6, gust: 28 },
    { direction: 'NW', sustained: 10, gust: 15 }
];
