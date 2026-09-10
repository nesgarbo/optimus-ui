export interface ElectricityMixRow {
    country: string;
    coal: number;
    gas: number;
    nuclear: number;
    hydro: number;
    windSolar: number;
    other: number;
}

export const electricityMixByCountry: ElectricityMixRow[] = [
    { country: 'France', coal: 1, gas: 7, nuclear: 65, hydro: 11, windSolar: 14, other: 2 },
    { country: 'Brazil', coal: 3, gas: 8, nuclear: 2, hydro: 56, windSolar: 18, other: 13 },
    { country: 'Germany', coal: 26, gas: 17, nuclear: 0, hydro: 4, windSolar: 40, other: 13 },
    { country: 'UK', coal: 1, gas: 33, nuclear: 15, hydro: 2, windSolar: 36, other: 13 },
    { country: 'Japan', coal: 30, gas: 33, nuclear: 8, hydro: 7, windSolar: 13, other: 9 },
    { country: 'US', coal: 16, gas: 43, nuclear: 19, hydro: 6, windSolar: 14, other: 2 },
    { country: 'China', coal: 61, gas: 3, nuclear: 5, hydro: 14, windSolar: 16, other: 1 },
    { country: 'India', coal: 75, gas: 2, nuclear: 3, hydro: 10, windSolar: 10, other: 0 }
];
