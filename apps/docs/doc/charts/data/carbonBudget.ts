export type Kind = 'fossil' | 'land' | 'sink' | 'total';
export interface CarbonItem {
    item: string;
    value: number;
    kind: Kind;
    isTotal?: boolean;
}

export const carbonBudget: CarbonItem[] = [
    { item: 'Coal', value: 15.5, kind: 'fossil' },
    { item: 'Oil', value: 11.8, kind: 'fossil' },
    { item: 'Natural gas', value: 7.9, kind: 'fossil' },
    { item: 'Cement & flaring', value: 2.1, kind: 'fossil' },
    { item: 'Land-use change', value: 3.9, kind: 'land' },
    { item: 'Gross emissions', value: 0, kind: 'total', isTotal: true },
    { item: 'Ocean sink', value: -10.6, kind: 'sink' },
    { item: 'Land sink', value: -12.8, kind: 'sink' },
    { item: 'Atmospheric growth', value: 0, kind: 'total', isTotal: true }
];
