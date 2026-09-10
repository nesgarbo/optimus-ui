export interface ComboSalesBreakdownPoint {
    quarter: string;
    core: number;
    addons: number;
    services: number;
    target: number;
    growth: number;
}

export const comboSalesBreakdown: ComboSalesBreakdownPoint[] = [
    { quarter: 'Q1 23', core: 780, addons: 210, services: 95, target: 1050, growth: 12.4 },
    { quarter: 'Q2 23', core: 840, addons: 245, services: 110, target: 1100, growth: 14.9 },
    { quarter: 'Q3 23', core: 905, addons: 285, services: 135, target: 1200, growth: 17.2 },
    { quarter: 'Q4 23', core: 980, addons: 340, services: 155, target: 1350, growth: 19.5 },
    { quarter: 'Q1 24', core: 1020, addons: 385, services: 170, target: 1450, growth: 21.1 },
    { quarter: 'Q2 24', core: 1105, addons: 440, services: 195, target: 1600, growth: 24.8 },
    { quarter: 'Q3 24', core: 1180, addons: 505, services: 220, target: 1750, growth: 28.3 },
    { quarter: 'Q4 24', core: 1275, addons: 590, services: 260, target: 1950, growth: 32.7 }
];
