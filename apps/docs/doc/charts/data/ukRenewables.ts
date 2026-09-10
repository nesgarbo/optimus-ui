export interface EnergyRow {
    month: string;
    wind: number;
    solar: number;
    hydro: number;
}

export const ukRenewables: EnergyRow[] = [
    { month: 'Jan', wind: 32, solar: 2, hydro: 7 },
    { month: 'Feb', wind: 28, solar: 3, hydro: 6 },
    { month: 'Mar', wind: 22, solar: 7, hydro: 6 },
    { month: 'Apr', wind: 18, solar: 11, hydro: 5 },
    { month: 'May', wind: 14, solar: 14, hydro: 5 },
    { month: 'Jun', wind: 10, solar: 16, hydro: 4 },
    { month: 'Jul', wind: 9, solar: 15, hydro: 4 },
    { month: 'Aug', wind: 11, solar: 14, hydro: 4 },
    { month: 'Sep', wind: 16, solar: 9, hydro: 5 },
    { month: 'Oct', wind: 22, solar: 5, hydro: 6 },
    { month: 'Nov', wind: 28, solar: 2, hydro: 7 },
    { month: 'Dec', wind: 30, solar: 2, hydro: 8 }
];
