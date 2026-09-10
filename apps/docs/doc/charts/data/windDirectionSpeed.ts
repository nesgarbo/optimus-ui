export interface WindSpeedRow {
    direction: string;
    morning: number;
    afternoon: number;
}

export const windDirectionSpeed: WindSpeedRow[] = [
    { direction: 'N', morning: 8, afternoon: 4 },
    { direction: 'NE', morning: 5, afternoon: 3 },
    { direction: 'E', morning: 10, afternoon: 5 },
    { direction: 'SE', morning: 14, afternoon: 6 },
    { direction: 'S', morning: 12, afternoon: 6 },
    { direction: 'SW', morning: 18, afternoon: 7 },
    { direction: 'W', morning: 15, afternoon: 7 },
    { direction: 'NW', morning: 6, afternoon: 4 }
];
