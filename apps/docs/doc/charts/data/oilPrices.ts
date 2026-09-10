export interface OilPriceYear {
    year: string;
    high: number;
    low: number;
    avg: number;
}

export const oilPrices: OilPriceYear[] = [
    { year: '2005', high: 68, low: 47, avg: 55 },
    { year: '2006', high: 77, low: 55, avg: 65 },
    { year: '2007', high: 98, low: 51, avg: 73 },
    { year: '2008', high: 147, low: 34, avg: 99 },
    { year: '2009', high: 81, low: 33, avg: 62 },
    { year: '2010', high: 93, low: 68, avg: 80 },
    { year: '2011', high: 127, low: 93, avg: 111 },
    { year: '2012', high: 126, low: 88, avg: 112 },
    { year: '2013', high: 118, low: 99, avg: 109 },
    { year: '2014', high: 115, low: 55, avg: 99 },
    { year: '2015', high: 68, low: 36, avg: 52 },
    { year: '2016', high: 58, low: 27, avg: 44 },
    { year: '2017', high: 68, low: 44, avg: 55 },
    { year: '2018', high: 86, low: 51, avg: 72 },
    { year: '2019', high: 75, low: 52, avg: 64 },
    { year: '2020', high: 72, low: 9, avg: 42 },
    { year: '2021', high: 86, low: 50, avg: 71 },
    { year: '2022', high: 133, low: 78, avg: 101 },
    { year: '2023', high: 98, low: 71, avg: 83 }
];
