export interface EconomicForecastPoint {
    year: string;
    actual: number | null;
    low: number;
    high: number;
}

export const comboEconomicForecast: EconomicForecastPoint[] = [
    { year: '2017', actual: 2.4, low: 2.3, high: 2.5 },
    { year: '2018', actual: 2.9, low: 2.8, high: 3.0 },
    { year: '2019', actual: 2.3, low: 2.2, high: 2.4 },
    { year: '2020', actual: -2.8, low: -3.2, high: -2.4 },
    { year: '2021', actual: 5.9, low: 5.6, high: 6.2 },
    { year: '2022', actual: 2.1, low: 1.9, high: 2.3 },
    { year: '2023', actual: 2.5, low: 2.3, high: 2.7 },
    { year: '2024', actual: 2.8, low: 2.6, high: 3.0 },
    { year: '2025', actual: null, low: 1.4, high: 2.6 },
    { year: '2026', actual: null, low: 1.2, high: 2.9 },
    { year: '2027', actual: null, low: 1.3, high: 3.1 }
];
