export interface Country {
    name: string;
    spend: number;
    life: number;
    pop: number;
}

export const europe: Country[] = [
    { name: 'Germany', spend: 7383, life: 81.1, pop: 84 },
    { name: 'Switzerland', spend: 7179, life: 83.9, pop: 8.8 },
    { name: 'Norway', spend: 7065, life: 83.2, pop: 5.4 },
    { name: 'Netherlands', spend: 6617, life: 81.7, pop: 17.5 },
    { name: 'Sweden', spend: 6438, life: 83.1, pop: 10.5 },
    { name: 'Austria', spend: 6383, life: 81.3, pop: 9.1 },
    { name: 'France', spend: 6517, life: 82.5, pop: 68 },
    { name: 'Denmark', spend: 6280, life: 81.4, pop: 5.9 },
    { name: 'Belgium', spend: 6002, life: 82.1, pop: 11.6 },
    { name: 'Ireland', spend: 5970, life: 82.4, pop: 5.1 },
    { name: 'UK', spend: 5387, life: 80.4, pop: 67 },
    { name: 'Finland', spend: 5105, life: 81.8, pop: 5.5 },
    { name: 'Italy', spend: 4291, life: 83.3, pop: 59 },
    { name: 'Spain', spend: 4149, life: 83.3, pop: 47 },
    { name: 'Czech Republic', spend: 4094, life: 79.2, pop: 10.5 },
    { name: 'Portugal', spend: 3743, life: 81.0, pop: 10.4 },
    { name: 'Estonia', spend: 2939, life: 78.8, pop: 1.3 },
    { name: 'Poland', spend: 2973, life: 75.4, pop: 38 },
    { name: 'Hungary', spend: 2708, life: 74.5, pop: 9.7 },
    { name: 'Greece', spend: 2670, life: 80.5, pop: 10.4 }
];

export const northAmerica: Country[] = [
    { name: 'USA', spend: 12555, life: 77.2, pop: 333 },
    { name: 'Canada', spend: 5905, life: 82.6, pop: 39 },
    { name: 'Mexico', spend: 1331, life: 75.0, pop: 128 }
];

export const asiaPacific: Country[] = [
    { name: 'Australia', spend: 6418, life: 83.2, pop: 26 },
    { name: 'Japan', spend: 4666, life: 84.2, pop: 125 },
    { name: 'South Korea', spend: 4570, life: 83.6, pop: 52 },
    { name: 'New Zealand', spend: 4721, life: 82.2, pop: 5.2 },
    { name: 'Israel', spend: 3750, life: 82.7, pop: 9.6 }
];

export const latinOther: Country[] = [
    { name: 'Chile', spend: 2697, life: 80.0, pop: 19.6 },
    { name: 'Colombia', spend: 1519, life: 72.5, pop: 51.5 },
    { name: 'Turkey', spend: 1419, life: 76.0, pop: 85 }
];

export const allCountries = [...europe, ...northAmerica, ...asiaPacific, ...latinOther];
export const OECD_AVG_SPEND = Math.round(allCountries.reduce((s, c) => s + c.spend, 0) / allCountries.length);
export const OECD_AVG_LIFE = +(allCountries.reduce((s, c) => s + c.life, 0) / allCountries.length).toFixed(1);

export const spendRanks: Map<string, number> = new Map();
[...allCountries].sort((a, b) => b.spend - a.spend).forEach((c, i) => spendRanks.set(c.name, i + 1));
