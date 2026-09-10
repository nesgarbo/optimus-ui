export interface RevenueRow {
    product: string;
    americas: number;
    emea: number;
    apac: number;
}

export const retailRegion: RevenueRow[] = [
    { product: 'Electronics', americas: 320, emea: 210, apac: 280 },
    { product: 'Apparel', americas: 180, emea: 240, apac: 160 },
    { product: 'Home & Kitchen', americas: 240, emea: 170, apac: 130 },
    { product: 'Grocery', americas: 300, emea: 260, apac: 190 },
    { product: 'Beauty', americas: 110, emea: 150, apac: 170 },
    { product: 'Sports', americas: 140, emea: 120, apac: 90 }
];
