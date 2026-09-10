export interface StockIndexPoint {
    q: string;
    sp: number;
    nas: number;
    dow: number;
}

export const stockIndices: StockIndexPoint[] = [
    { q: 'Q1 20', sp: 100, nas: 100, dow: 100 },
    { q: 'Q2 20', sp: 120, nas: 131, dow: 115 },
    { q: 'Q3 20', sp: 129, nas: 145, dow: 121 },
    { q: 'Q4 20', sp: 140, nas: 158, dow: 132 },
    { q: 'Q1 21', sp: 147, nas: 161, dow: 141 },
    { q: 'Q2 21', sp: 160, nas: 178, dow: 150 },
    { q: 'Q3 21', sp: 163, nas: 181, dow: 149 },
    { q: 'Q4 21', sp: 177, nas: 192, dow: 157 },
    { q: 'Q1 22', sp: 169, nas: 173, dow: 152 },
    { q: 'Q2 22', sp: 146, nas: 143, dow: 138 },
    { q: 'Q3 22', sp: 142, nas: 137, dow: 133 },
    { q: 'Q4 22', sp: 150, nas: 140, dow: 146 },
    { q: 'Q1 23', sp: 161, nas: 160, dow: 150 },
    { q: 'Q2 23', sp: 174, nas: 180, dow: 153 },
    { q: 'Q3 23', sp: 167, nas: 175, dow: 149 },
    { q: 'Q4 23', sp: 185, nas: 195, dow: 164 },
    { q: 'Q1 24', sp: 198, nas: 208, dow: 172 },
    { q: 'Q2 24', sp: 210, nas: 228, dow: 177 },
    { q: 'Q3 24', sp: 215, nas: 232, dow: 185 },
    { q: 'Q4 24', sp: 222, nas: 245, dow: 189 }
];
