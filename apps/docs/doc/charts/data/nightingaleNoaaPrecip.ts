export interface MonthData {
    month: string;
    precip: number;
    season: 'winter' | 'spring' | 'summer' | 'fall';
    count: 1;
}

export const nightingaleNoaaPrecip: MonthData[] = [
    { month: 'Jan', precip: 2.31, season: 'winter', count: 1 },
    { month: 'Feb', precip: 2.18, season: 'winter', count: 1 },
    { month: 'Mar', precip: 2.89, season: 'spring', count: 1 },
    { month: 'Apr', precip: 3.02, season: 'spring', count: 1 },
    { month: 'May', precip: 3.44, season: 'spring', count: 1 },
    { month: 'Jun', precip: 3.21, season: 'summer', count: 1 },
    { month: 'Jul', precip: 3.09, season: 'summer', count: 1 },
    { month: 'Aug', precip: 3.18, season: 'summer', count: 1 },
    { month: 'Sep', precip: 2.76, season: 'fall', count: 1 },
    { month: 'Oct', precip: 2.54, season: 'fall', count: 1 },
    { month: 'Nov', precip: 2.67, season: 'fall', count: 1 },
    { month: 'Dec', precip: 2.48, season: 'winter', count: 1 }
];
