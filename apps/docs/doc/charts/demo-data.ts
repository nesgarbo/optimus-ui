/**
 * Shared demo data.
 *
 * The numbers are the ones the reference documentation uses for the same demos, so a chart here can
 * be put side by side with the original and any difference is a real difference rather than a
 * consequence of different data.
 */

/** Six months of a single metric, for the simplest line and area demos. */
export const ACTIVATION = [
    { month: 'Jan', activation: 41 },
    { month: 'Feb', activation: 46 },
    { month: 'Mar', activation: 49 },
    { month: 'Apr', activation: 45 },
    { month: 'May', activation: 53 },
    { month: 'Jun', activation: 58 }
];

/** Three device categories, for grouped and stacked demos. */
export const DEVICES = [
    { month: 'Jan', desktop: 186, mobile: 80, tablet: 45 },
    { month: 'Feb', desktop: 305, mobile: 200, tablet: 98 },
    { month: 'Mar', desktop: 237, mobile: 120, tablet: 67 },
    { month: 'Apr', desktop: 73, mobile: 190, tablet: 110 },
    { month: 'May', desktop: 209, mobile: 130, tablet: 85 },
    { month: 'Jun', desktop: 214, mobile: 140, tablet: 92 }
];

/** A pipeline metric with a companion series, for the gradient and area demos. */
export const PIPELINE = [
    { month: 'Jan', pipeline: 62, confidence: 48 },
    { month: 'Feb', pipeline: 66, confidence: 52 },
    { month: 'Mar', pipeline: 71, confidence: 56 },
    { month: 'Apr', pipeline: 69, confidence: 61 },
    { month: 'May', pipeline: 76, confidence: 65 },
    { month: 'Jun', pipeline: 82, confidence: 69 },
    { month: 'Jul', pipeline: 86, confidence: 73 },
    { month: 'Aug', pipeline: 84, confidence: 71 },
    { month: 'Sep', pipeline: 78, confidence: 67 },
    { month: 'Oct', pipeline: 74, confidence: 63 },
    { month: 'Nov', pipeline: 70, confidence: 59 },
    { month: 'Dec', pipeline: 77, confidence: 64 }
];

/** One metric per curve type, so the six interpolations can be compared on one chart. */
export const CURVES = [
    { hour: '6am', linear: 12, smooth: 22, step: 32, stepBefore: 42, stepAfter: 52, spline: 62 },
    { hour: '8am', linear: 15, smooth: 26, step: 35, stepBefore: 45, stepAfter: 55, spline: 66 },
    { hour: '10am', linear: 19, smooth: 30, step: 38, stepBefore: 48, stepAfter: 58, spline: 70 },
    { hour: '12pm', linear: 24, smooth: 34, step: 44, stepBefore: 54, stepAfter: 64, spline: 74 },
    { hour: '2pm', linear: 26, smooth: 36, step: 46, stepBefore: 56, stepAfter: 66, spline: 76 },
    { hour: '4pm', linear: 23, smooth: 32, step: 42, stepBefore: 52, stepAfter: 62, spline: 72 },
    { hour: '6pm', linear: 20, smooth: 28, step: 38, stepBefore: 48, stepAfter: 58, spline: 68 },
    { hour: '8pm', linear: 16, smooth: 24, step: 34, stepBefore: 44, stepAfter: 54, spline: 64 }
];

/** A series with holes in it, for the null-handling demo. */
export const WITH_GAPS = [
    { month: 'Jan', signups: 41 },
    { month: 'Feb', signups: 46 },
    { month: 'Mar', signups: null },
    { month: 'Apr', signups: null },
    { month: 'May', signups: 53 },
    { month: 'Jun', signups: 58 },
    { month: 'Jul', signups: null },
    { month: 'Aug', signups: 67 }
];

/** Population figures, for the horizontal bar demo. */
export const CITIES = [
    { city: 'Tokyo', population: 37 },
    { city: 'Delhi', population: 32 },
    { city: 'Shanghai', population: 29 },
    { city: 'São Paulo', population: 22 },
    { city: 'Mumbai', population: 21 },
    { city: 'Cairo', population: 21 }
];

/** A revenue bridge, for the waterfall demo. */
export const BRIDGE = [
    { stage: 'Opening', delta: 420, total: false },
    { stage: 'New', delta: 180, total: false },
    { stage: 'Expansion', delta: 95, total: false },
    { stage: 'Churn', delta: -140, total: false },
    { stage: 'Contraction', delta: -60, total: false },
    { stage: 'Closing', delta: null, total: true }
];

/** A top-to-bottom gradient, for the area fill demo. */
export const TOP_TO_BOTTOM_GRADIENT = {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
        { offset: 0, color: 'rgba(93, 174, 234, 0.5)' },
        { offset: 1, color: 'rgba(93, 174, 234, 0.02)' }
    ]
};

/** A gradient that is brightest in the middle, for the second series of the same demo. */
export const CENTER_BRIGHT_GRADIENT = {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
        { offset: 0, color: 'rgba(16, 169, 129, 0.05)' },
        { offset: 0.4, color: 'rgba(16, 169, 129, 0.5)' },
        { offset: 0.6, color: 'rgba(16, 169, 129, 0.5)' },
        { offset: 1, color: 'rgba(16, 169, 129, 0.05)' }
    ]
};

/** Monthly temperature extremes, for the range band demo. */
export const TEMPERATURES = [
    { month: 'Jan', high: 8, low: -2 },
    { month: 'Feb', high: 10, low: 0 },
    { month: 'Mar', high: 15, low: 4 },
    { month: 'Apr', high: 20, low: 8 },
    { month: 'May', high: 25, low: 13 },
    { month: 'Jun', high: 30, low: 18 },
    { month: 'Jul', high: 33, low: 21 },
    { month: 'Aug', high: 32, low: 20 },
    { month: 'Sep', high: 27, low: 15 },
    { month: 'Oct', high: 20, low: 9 },
    { month: 'Nov', high: 13, low: 4 },
    { month: 'Dec', high: 9, low: 0 }
];

/** Traffic sources, for the pie and donut demos. */
export const TRAFFIC = [
    { source: 'Organic', sessions: 4200 },
    { source: 'Direct', sessions: 2800 },
    { source: 'Referral', sessions: 1600 },
    { source: 'Social', sessions: 1100 },
    { source: 'Email', sessions: 700 }
];

/** A single completion figure, for the gauge demo. */
export const COMPLETION = [
    { state: 'Complete', share: 68 },
    { state: 'Remaining', share: 32 }
];

/** Rose-chart data, where the radius carries the magnitude as well as the angle. */
export const WIND = [
    { direction: 'N', strength: 42 },
    { direction: 'NE', strength: 28 },
    { direction: 'E', strength: 65 },
    { direction: 'SE', strength: 34 },
    { direction: 'S', strength: 51 },
    { direction: 'SW', strength: 22 },
    { direction: 'W', strength: 78 },
    { direction: 'NW', strength: 39 }
];

/** A correlation cloud, for the scatter demo. */
export const CORRELATION = Array.from({ length: 60 }, (_, i) => {
    const spend = 20 + ((i * 37) % 80);

    return {
        spend,
        // A deliberate trend with scatter around it, so the cloud reads as a relationship.
        revenue: spend * 2.4 + (((i * 53) % 40) - 20),
        accounts: 5 + ((i * 17) % 45)
    };
});

/** Skill profiles, for the radar demo. */
export const SKILLS = [
    { axis: 'Speed', current: 82, target: 70 },
    { axis: 'Reliability', current: 74, target: 90 },
    { axis: 'Coverage', current: 61, target: 85 },
    { axis: 'Cost', current: 55, target: 60 },
    { axis: 'Support', current: 88, target: 75 },
    { axis: 'Docs', current: 67, target: 80 }
];

/** A day-by-hour activity matrix, for the heatmap demo. Some cells are deliberately absent. */
export const ACTIVITY = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['00', '04', '08', '12', '16', '20'];
    const rows: { day: string; hour: string; sessions: number | null }[] = [];

    days.forEach((day, d) => {
        hours.forEach((hour, h) => {
            // A couple of holes, so the empty-cell treatment is visible in the demo.
            const missing = (d === 5 && h === 0) || (d === 6 && h === 1);
            const weekend = d >= 5;
            const peak = h === 3 ? 1.6 : h === 2 || h === 4 ? 1.2 : 0.4;

            rows.push({ day, hour, sessions: missing ? null : Math.round(40 * peak * (weekend ? 0.5 : 1) + ((d * 7 + h * 13) % 25)) });
        });
    });

    return rows;
})();

/** A revenue hierarchy, for the treemap demo. */
export const PORTFOLIO = [
    { id: 'emea', label: 'EMEA', parent: '', revenue: 0, margin: 0 },
    { id: 'amer', label: 'Americas', parent: '', revenue: 0, margin: 0 },
    { id: 'apac', label: 'APAC', parent: '', revenue: 0, margin: 0 },
    { id: 'uk', label: 'UK', parent: 'emea', revenue: 420, margin: 18 },
    { id: 'de', label: 'Germany', parent: 'emea', revenue: 310, margin: 12 },
    { id: 'fr', label: 'France', parent: 'emea', revenue: 185, margin: 9 },
    { id: 'us', label: 'United States', parent: 'amer', revenue: 780, margin: 22 },
    { id: 'ca', label: 'Canada', parent: 'amer', revenue: 160, margin: 15 },
    { id: 'br', label: 'Brazil', parent: 'amer', revenue: 120, margin: 6 },
    { id: 'jp', label: 'Japan', parent: 'apac', revenue: 240, margin: 19 },
    { id: 'au', label: 'Australia', parent: 'apac', revenue: 150, margin: 14 },
    { id: 'sg', label: 'Singapore', parent: 'apac', revenue: 95, margin: 11 }
];

/** Daily prices, for the candlestick demos. */
export const PRICES = [
    { date: 'Jan 2', open: 170.2, high: 173.5, low: 169, close: 172.8 },
    { date: 'Jan 3', open: 172.8, high: 174.1, low: 170.5, close: 171 },
    { date: 'Jan 4', open: 171, high: 172.3, low: 168.2, close: 168.8 },
    { date: 'Jan 5', open: 168.8, high: 170, low: 166.5, close: 169.5 },
    { date: 'Jan 8', open: 169.5, high: 172, low: 169, close: 171.8 },
    { date: 'Jan 9', open: 171.8, high: 175.2, low: 171, close: 174.5 },
    { date: 'Jan 10', open: 174.5, high: 176.8, low: 173.2, close: 175.9 },
    { date: 'Jan 11', open: 175.9, high: 177, low: 174, close: 174.8 },
    { date: 'Jan 12', open: 174.8, high: 175.5, low: 172, close: 172.5 },
    { date: 'Jan 16', open: 172.5, high: 174, low: 171.2, close: 173.8 },
    { date: 'Jan 17', open: 173.8, high: 176.5, low: 173, close: 176 },
    { date: 'Jan 18', open: 176, high: 178.2, low: 175.5, close: 177.5 },
    { date: 'Jan 19', open: 177.5, high: 179, low: 176, close: 178.8 },
    { date: 'Jan 22', open: 178.8, high: 180.5, low: 178, close: 180 },
    { date: 'Jan 23', open: 180, high: 181.2, low: 177.5, close: 178.2 }
];
