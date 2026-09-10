export interface EvRow {
    year: string;
    china: number;
    europe: number;
    usa: number;
    otherAsia: number;
    rest: number;
}

export const evSalesByRegion: EvRow[] = [
    { year: '2019', china: 1.2, europe: 0.6, usa: 0.3, otherAsia: 0.2, rest: 0.1 },
    { year: '2020', china: 1.4, europe: 1.4, usa: 0.3, otherAsia: 0.2, rest: 0.1 },
    { year: '2021', china: 3.3, europe: 2.3, usa: 0.7, otherAsia: 0.4, rest: 0.1 },
    { year: '2022', china: 5.9, europe: 2.7, usa: 0.9, otherAsia: 0.6, rest: 0.2 },
    { year: '2023', china: 8.1, europe: 3.2, usa: 1.4, otherAsia: 0.9, rest: 0.3 }
];
