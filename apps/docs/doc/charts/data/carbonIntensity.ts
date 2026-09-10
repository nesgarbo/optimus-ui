export interface CarbonZone {
    label: string;
    min: number;
    max: number;
    range: string;
    desc: string;
    color: string;
    faded: string;
}

export const CURRENT = 178;

export const ZONES: CarbonZone[] = [
    { label: 'Very Low', min: 0, max: 100, range: '< 100', desc: 'Predominantly wind, solar & nuclear', color: '#10a981', faded: 'rgba(16,169,129,0.18)' },
    { label: 'Low', min: 100, max: 200, range: '100 – 200', desc: 'Mostly renewables, some gas peaking', color: '#4ecdc4', faded: 'rgba(78,205,196,0.18)' },
    { label: 'Moderate', min: 200, max: 300, range: '200 – 300', desc: 'Significant gas generation on grid', color: '#ffad5a', faded: 'rgba(255,173,90,0.2)' },
    { label: 'High', min: 300, max: 500, range: '> 300', desc: 'Heavy reliance on unabated gas & coal', color: '#e5484d', faded: 'rgba(229,72,77,0.2)' }
];
