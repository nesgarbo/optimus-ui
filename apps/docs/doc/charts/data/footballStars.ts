export interface AttrRow {
    attr: string;
    messi: number;
    mbappe: number;
    haaland: number;
}

export const footballStars: AttrRow[] = [
    { attr: 'Pace', messi: 80, mbappe: 97, haaland: 89 },
    { attr: 'Shooting', messi: 87, mbappe: 90, haaland: 93 },
    { attr: 'Passing', messi: 90, mbappe: 80, haaland: 65 },
    { attr: 'Dribbling', messi: 94, mbappe: 92, haaland: 80 },
    { attr: 'Defending', messi: 33, mbappe: 36, haaland: 45 },
    { attr: 'Physical', messi: 64, mbappe: 77, haaland: 88 }
];
