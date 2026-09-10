export interface Row {
    symbol: string;
    name: string;
    last: number;
    changePct: number;
    price: number[];
    volume: number[];
}

export const rows: Row[] = [
    { symbol: 'AAPL', name: 'Apple', last: 214.65, changePct: +1.8, price: [209, 210, 213, 211, 215, 213, 214], volume: [48, 52, 61, 49, 78, 55, 50] },
    { symbol: 'MSFT', name: 'Microsoft', last: 421.12, changePct: +0.6, price: [418, 420, 419, 423, 422, 420, 421], volume: [22, 24, 23, 28, 26, 21, 22] },
    { symbol: 'NVDA', name: 'Nvidia', last: 908.88, changePct: +3.4, price: [860, 872, 869, 890, 895, 902, 908], volume: [155, 180, 165, 210, 195, 175, 188] },
    { symbol: 'GOOGL', name: 'Alphabet', last: 178.33, changePct: -0.4, price: [181, 179, 178, 180, 179, 178, 178], volume: [32, 30, 29, 31, 28, 27, 30] },
    { symbol: 'AMZN', name: 'Amazon', last: 186.14, changePct: +1.2, price: [182, 184, 183, 185, 184, 187, 186], volume: [42, 45, 44, 48, 46, 50, 44] },
    { symbol: 'META', name: 'Meta', last: 498.77, changePct: -1.6, price: [510, 508, 505, 502, 500, 499, 498], volume: [18, 22, 25, 20, 24, 21, 19] },
    { symbol: 'TSLA', name: 'Tesla', last: 172.45, changePct: -3.1, price: [184, 180, 178, 176, 175, 174, 172], volume: [85, 110, 95, 120, 108, 92, 88] },
    { symbol: 'AVGO', name: 'Broadcom', last: 1398, changePct: +2.2, price: [1355, 1370, 1365, 1380, 1392, 1395, 1398], volume: [5, 6, 4, 8, 7, 6, 5] }
];
