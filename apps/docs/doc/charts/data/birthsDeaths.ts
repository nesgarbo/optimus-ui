export interface BirthsDeathsYear {
    year: string;
    births: number;
    deaths: number;
}

const birthAnchors: [number, number][] = [
    [1950, 97],
    [1955, 104],
    [1960, 118],
    [1962, 121],
    [1965, 123],
    [1968, 119],
    [1970, 121],
    [1975, 117],
    [1980, 126],
    [1985, 134],
    [1988, 137],
    [1990, 137],
    [1995, 132],
    [2000, 133],
    [2005, 135],
    [2010, 137],
    [2015, 140],
    [2018, 138],
    [2020, 134],
    [2022, 131],
    [2026, 130],
    [2030, 128],
    [2035, 127],
    [2040, 126],
    [2045, 125],
    [2050, 124],
    [2055, 123],
    [2060, 122],
    [2065, 122],
    [2070, 121],
    [2075, 121],
    [2080, 120],
    [2085, 120],
    [2090, 119],
    [2095, 118],
    [2100, 118]
];

const deathAnchors: [number, number][] = [
    [1950, 48],
    [1955, 45],
    [1960, 44],
    [1962, 47],
    [1965, 50],
    [1968, 52],
    [1970, 52],
    [1975, 48],
    [1980, 50],
    [1985, 51],
    [1988, 50],
    [1990, 50],
    [1995, 52],
    [2000, 55],
    [2005, 55],
    [2010, 56],
    [2015, 57],
    [2018, 58],
    [2020, 67],
    [2022, 60],
    [2026, 65],
    [2030, 70],
    [2035, 75],
    [2040, 81],
    [2045, 86],
    [2050, 92],
    [2055, 97],
    [2060, 102],
    [2065, 106],
    [2070, 109],
    [2075, 113],
    [2080, 116],
    [2085, 118],
    [2090, 121],
    [2095, 122],
    [2100, 123]
];

function lerpAnchors(anchors: [number, number][], year: number): number {
    if (year <= anchors[0][0]) return anchors[0][1];

    if (year >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];

    for (let i = 0; i < anchors.length - 1; i++) {
        const [x0, y0] = anchors[i];
        const [x1, y1] = anchors[i + 1];

        if (year >= x0 && year <= x1) {
            const t = (year - x0) / (x1 - x0);

            return Math.round((y0 + (y1 - y0) * t) * 10) / 10;
        }
    }

    return anchors[anchors.length - 1][1];
}

export const birthsDeaths: BirthsDeathsYear[] = Array.from({ length: 151 }, (_, i) => {
    const year = 1950 + i;

    return {
        year: String(year),
        births: lerpAnchors(birthAnchors, year),
        deaths: lerpAnchors(deathAnchors, year)
    };
});
