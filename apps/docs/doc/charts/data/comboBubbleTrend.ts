export const comboBubbleTrend = [
    { channel: 'Paid search', spend: 32, conversion: 4.2, revenue: 148 },
    { channel: 'Paid social', spend: 28, conversion: 2.9, revenue: 96 },
    { channel: 'Display retargeting', spend: 14, conversion: 3.6, revenue: 72 },
    { channel: 'YouTube', spend: 22, conversion: 1.8, revenue: 54 },
    { channel: 'Podcast', spend: 9, conversion: 2.1, revenue: 31 },
    { channel: 'Affiliate', spend: 16, conversion: 5.4, revenue: 124 },
    { channel: 'SEO content', spend: 6, conversion: 6.1, revenue: 88 },
    { channel: 'Email nurture', spend: 3, conversion: 7.8, revenue: 52 },
    { channel: 'Webinars', spend: 11, conversion: 4.9, revenue: 63 },
    { channel: 'Cold outbound', spend: 19, conversion: 1.3, revenue: 38 },
    { channel: 'Partnerships', spend: 8, conversion: 6.5, revenue: 95 },
    { channel: 'Organic social', spend: 4, conversion: 3.3, revenue: 28 }
];

export const comboBubbleTrendMedian = { spend: 13, conversion: 3.75 };

const xs = comboBubbleTrend.map((c) => c.spend);
const ys = comboBubbleTrend.map((c) => c.conversion);
const n = xs.length;
const meanX = xs.reduce((a, b) => a + b, 0) / n;
const meanY = ys.reduce((a, b) => a + b, 0) / n;
let num = 0;
let den = 0;

for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
}

const slope = den === 0 ? 0 : num / den;
const intercept = meanY - slope * meanX;
const xMin = Math.min(...xs);
const xMax = Math.max(...xs);
const steps = 48;

export const comboBubbleTrendLine = Array.from({ length: steps + 1 }, (_, i) => {
    const spend = xMin + ((xMax - xMin) * i) / steps;

    return { spend, conversion: slope * spend + intercept };
});
