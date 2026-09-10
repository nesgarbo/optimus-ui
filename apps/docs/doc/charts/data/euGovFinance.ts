export type Kind = 'revenue' | 'spending' | 'total';

export interface FinanceItem {
    item: string;
    value: number;
    kind: Kind;
    isTotal?: boolean;
}

const rawData: FinanceItem[] = [
    { item: 'Income & wealth tax', value: 13.2, kind: 'revenue' },
    { item: 'Production tax', value: 12.9, kind: 'revenue' },
    { item: 'Social contributions', value: 13.6, kind: 'revenue' },
    { item: 'Other revenue', value: 6.6, kind: 'revenue' },
    { item: 'Total revenue', value: 0, kind: 'total', isTotal: true },
    { item: 'Social protection', value: -19.1, kind: 'spending' },
    { item: 'Health', value: -7.6, kind: 'spending' },
    { item: 'Public services', value: -5.9, kind: 'spending' },
    { item: 'Economic affairs', value: -6.0, kind: 'spending' },
    { item: 'Education', value: -4.8, kind: 'spending' },
    { item: 'Other functions', value: -5.5, kind: 'spending' },
    { item: 'Balance', value: 0, kind: 'total', isTotal: true }
];

let running = 0;

export const euGovFinance = rawData.map((d) => {
    if (!d.isTotal) running += d.value;

    return { ...d, cumulative: running };
});
